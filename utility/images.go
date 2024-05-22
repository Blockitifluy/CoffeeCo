package utility

import (
	"bytes"
	"errors"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/gif"
	"image/jpeg"
	"image/png"
	"net/http"
	"strconv"
	"time"
)

// ImageSizeLimit is the size limit of all uploaded images
const ImageSizeLimit = 5000 * 1000

// ImageMaxAge is the cache length
const ImageMaxAge = 14 * 7 * 24 * int(time.Hour)

// IsImageSurported checks if a content-type is surported
func IsImageSurported(contentType string) bool {
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

// ImageAccept is used by [github.com/Blockitifluy/CoffeeCo/utility.CanImageBeAccepted]
type ImageAccept struct {
	Ok   bool
	Code int
	Msg  string
}

// CanImageBeAccepted checks: the size and content-type; for an image
func CanImageBeAccepted(r *http.Request, mimetype string) ImageAccept {
	rawLength, lengthExists := r.Header["Content-Length"]
	contentLength, lengthErr := strconv.Atoi(rawLength[0])

	if !lengthExists || lengthErr != nil {
		return ImageAccept{
			Ok:   false,
			Code: http.StatusLengthRequired,
			Msg:  "Length Required",
		}
	}

	var isTypeAccepted bool = IsImageSurported(mimetype)
	if !isTypeAccepted {
		return ImageAccept{
			Ok:   false,
			Code: http.StatusUnsupportedMediaType,
			Msg:  "Format not Supported (PNG, JPEG, GIF)",
		}
	}

	if contentLength >= ImageSizeLimit {
		msg := fmt.Sprintf("Image too Big (%dkb limit)", ImageSizeLimit)
		return ImageAccept{
			Ok:   false,
			Code: http.StatusRequestEntityTooLarge,
			Msg:  msg,
		}
	}

	return ImageAccept{
		Ok:   true,
		Code: 200,
		Msg:  "",
	}
}

// CompressJPEG compresses a JPEG image
func CompressJPEG(b []byte, quality int) ([]byte, error) {
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

// CompressPNG compresses a PNG image
func CompressPNG(b []byte, compressionLevel png.CompressionLevel) ([]byte, error) {
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

// CompressGIF compress a GIF image
func CompressGIF(b []byte, numColors int) ([]byte, error) {
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

// AutoCompress choices the method to compresses an image
func AutoCompress(mimetype string, img []byte) ([]byte, error) {
	switch mimetype {
	case "image/png":
		return CompressPNG(img, png.DefaultCompression)
	case "image/jpeg":
		return CompressJPEG(img, jpeg.DefaultQuality)
	case "image/gif":
		return CompressGIF(img, 25)
	default:
		return nil, errors.New("No compress found for mimetype")
	}
}
