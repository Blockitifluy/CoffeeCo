package api

import (
	"bytes"
	"compress/gzip"
	"database/sql"
	"errors"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/gif"
	"image/jpeg"
	"image/png"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

const imageSizeLimit int = 5000 * 1000 // 5 Megabytes

func isImageSurported(contentType string) bool {
	switch contentType {
	case "image/png":
		return true
	case "image/jpeg":
		return true
	case "image/gif":
		return true
	}
	return false
}

type imageAccept struct {
	ok   bool
	code int
	msg  string
}

func canImageBeAccepted(r *http.Request, mimetype string) imageAccept {
	rawLength, lengthExists := r.Header["Content-Length"]
	contentLength, lengthErr := strconv.Atoi(rawLength[0])

	if !lengthExists || lengthErr != nil {
		return imageAccept{
			ok:   false,
			code: http.StatusLengthRequired,
			msg:  "Length Required",
		}
	}

	var isTypeAccepted bool = isImageSurported(mimetype)
	if !isTypeAccepted {
		return imageAccept{
			ok:   false,
			code: http.StatusUnsupportedMediaType,
			msg:  "Format not Supported (PNG, JPEG, GIF)",
		}
	}

	if contentLength >= imageSizeLimit {
		msg := fmt.Sprintf("Image too Big (%dkb limit)", imageSizeLimit)
		return imageAccept{
			ok:   false,
			code: http.StatusRequestEntityTooLarge,
			msg:  msg,
		}
	}

	return imageAccept{
		ok:   true,
		code: 200,
		msg:  "",
	}
}

func compressJPEG(b []byte, quality int) ([]byte, error) {
	var out []byte = make([]byte, 0)

	r := bytes.NewReader(b)

	img, _, err := image.Decode(r)
	if err != nil {
		return out, err
	}

	options := &jpeg.Options{Quality: quality}

	var buf bytes.Buffer
	encodeErr := jpeg.Encode(&buf, img, options)
	if encodeErr != nil {
		return make([]byte, 0), err
	}

	return buf.Bytes(), nil
}

func compressPNG(b []byte, compressionLevel png.CompressionLevel) ([]byte, error) {
	img, _, err := image.Decode(bytes.NewReader(b))
	if err != nil {
		return make([]byte, 0), err
	}

	var buf bytes.Buffer
	encoder := png.Encoder{CompressionLevel: compressionLevel}

	encodeErr := encoder.Encode(&buf, img)
	if encodeErr != nil {
		return make([]byte, 0), encodeErr
	}

	return buf.Bytes(), nil
}

func compressGIF(b []byte, numColors int) ([]byte, error) {
	img, err := gif.DecodeAll(bytes.NewReader(b))
	if err != nil {
		return make([]byte, 0), err
	}

	if numColors > 0 && len(img.Image[0].Palette) > numColors {
		for i := range img.Image {
			img.Image[i] = reduceColors(img.Image[i], numColors)
		}
	}

	var buf bytes.Buffer
	encodeErr := gif.EncodeAll(&buf, img)
	if encodeErr != nil {
		return make([]byte, 0), encodeErr
	}

	return buf.Bytes(), nil
}

func reduceColors(img *image.Paletted, numColors int) *image.Paletted {
	palette := make([]color.Color, numColors)
	copy(palette, img.Palette)

	// Convert the frame to use the new reduced palette
	bounds := img.Bounds()
	newImg := image.NewPaletted(bounds, palette)

	draw.FloydSteinberg.Draw(newImg, bounds, img, image.ZP)

	return newImg
}

func autoCompress(mimetype string, img []byte) ([]byte, error) {
	switch mimetype {
	case "image/png":
		return compressPNG(img, png.DefaultCompression)
	case "image/jpeg":
		return compressJPEG(img, jpeg.DefaultQuality)
	case "image/gif":
		return compressGIF(img, 25)
	default:
		return nil, errors.New("No compress found for mimetype")
	}
}

// APIUploadImage is an api call. Doesn't work as expected when called outside an API context
//
// Uploads an image (png, jpeg and gif) with a limited size, compresses it and add to database
func (srv *Server) APIUploadImage(w http.ResponseWriter, r *http.Request) {
	mimetype := r.Header.Get("Content-Type")
	if Accepted := canImageBeAccepted(r, mimetype); !Accepted.ok {
		http.Error(w, Accepted.msg, Accepted.code)
		return
	}

	img, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	compress, compErr := autoCompress(mimetype, img)
	if compErr != nil {
		http.Error(w, compErr.Error(), http.StatusInternalServerError)
		return
	}

	ID := uuid.New()

	var b bytes.Buffer
	gw := gzip.NewWriter(&b)
	if _, err := gw.Write(compress); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	gw.Close()

	_, resultErr := srv.Exec("INSERT INTO Images (url, content, mimetype) VALUES (?, ?, ?)", ID.String(), b.Bytes(), mimetype)
	if resultErr != nil {
		http.Error(w, resultErr.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(fmt.Sprintf(`{"fileName": "%s"}`, ID.String())))
}

// APIDownloadImage is an api call. Doesn't work as expected when called outside an API context
//
// Retrieves an image from the batabase, compress for network
func (srv *Server) APIDownloadImage(w http.ResponseWriter, r *http.Request) {
	URLParams := mux.Vars(r)
	imageURL, err := url.QueryUnescape(URLParams["url"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	imageRow := srv.QueryRow("SELECT content, mimetype FROM Images WHERE url = ?", imageURL)

	var (
		Image    []byte = make([]byte, 0)
		mimetype string = ""
	)

	if err := imageRow.Scan(&Image, &mimetype); err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "No Image Found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	const maxAge int = 14 * 7 * 24 * int(time.Hour)

	w.Header().Set("Cache-Control", fmt.Sprintf("max-age=%d", maxAge))
	w.Header().Set("Content-Encoding", "gzip")
	w.Header().Set("Content-Type", mimetype)
	w.Write(Image) // Faster Speed over network
}
