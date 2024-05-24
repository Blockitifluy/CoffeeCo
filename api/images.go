package api

import (
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/Blockitifluy/CoffeeCo/utility"
	"github.com/blockloop/scan"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

// ImageData contains the URL, content, content-type of an image
type ImageData struct {
	URL         string `db:"url"`
	Content     []byte `db:"Content"`
	ContentType string `db:"mimetype"`
}

// APIUploadImage is an api call. Doesn't work as expected when called outside an API context
//
// Uploads an image (png, jpeg and gif) with a limited size, compresses it and add to database
func (srv *Server) APIUploadImage(w http.ResponseWriter, r *http.Request) {
	mimetype := r.Header.Get("Content-Type")
	if Accepted := utility.CanImageBeAccepted(r, mimetype); !Accepted.Ok {
		utility.Error(w, utility.HTTPError{
			Public:  Accepted.Msg,
			Message: Accepted.Msg,
			Code:    Accepted.Code,
		})
		return
	}

	img, err := io.ReadAll(r.Body)
	if err != nil {
		utility.Error(w, utility.HTTPError{
			Public:  "Couldn't Read Image",
			Message: err.Error(),
			Code:    500,
		})
		return
	}

	compress, compErr := utility.AutoCompress(mimetype, img)
	if compErr != nil {
		utility.Error(w, utility.HTTPError{
			Public:  "Couldn't Compress Image",
			Message: compErr.Error(),
			Code:    500,
		})
		return
	}

	ID := uuid.New()
	zipped, err := utility.GZipBytes(compress)
	if err != nil {
		utility.Error(w, utility.HTTPError{
			Public:  "Couldn't Zip Image",
			Message: err.Error(),
			Code:    500,
		})
		return
	}

	_, resultErr := srv.Exec("INSERT INTO Images (url, content, mimetype) VALUES (?, ?, ?)", ID.String(), zipped, mimetype)
	if resultErr != nil {
		utility.Error(w, utility.HTTPError{
			Public:  "Couldn't Add image to Server",
			Message: resultErr.Error(),
			Code:    500,
		})
		return
	}

	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte(ID.String()))
}

// APIDownloadImage is an api call. Doesn't work as expected when called outside an API context
//
// Retrieves an image from the batabase, compress for network
func (srv *Server) APIDownloadImage(w http.ResponseWriter, r *http.Request) {
	URLParams := mux.Vars(r)
	imageURL, err := url.QueryUnescape(URLParams["url"])
	if err != nil {
		utility.Error(w, utility.HTTPError{
			Public:  "Couldn't Write Image",
			Message: err.Error(),
			Code:    400,
		})
		return
	}

	rows, err := srv.Query("SELECT content, mimetype FROM Images WHERE url = ?", imageURL)
	if err != nil {
		utility.Error(w, utility.HTTPError{
			Public:  "Couldn't Get Image",
			Message: err.Error(),
			Code:    500,
		})
		return
	}

	var Image ImageData
	if err := scan.Row(&Image, rows); err != nil {
		utility.SendScanErr(w, err, nil)
		return
	}

	w.Header().Set("Cache-Control", fmt.Sprintf("max-age=%d", utility.ImageMaxAge))
	w.Header().Set("Content-Encoding", "gzip")
	w.Header().Set("Content-Type", Image.ContentType)
	w.Write(Image.Content) // Faster Speed over network
}
