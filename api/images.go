package api

import (
	"bytes"
	"compress/gzip"
	"database/sql"
	"fmt"
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

	ID := uuid.New()

	var b bytes.Buffer
	gw := gzip.NewWriter(&b)
	if _, err := gw.Write(img); err != nil {
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
