package api

import (
	"database/sql"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/Blockitifluy/CoffeeCo/utility"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

// APIUploadImage is an api call. Doesn't work as expected when called outside an API context
//
// Uploads an image (png, jpeg and gif) with a limited size, compresses it and add to database
func (srv *Server) APIUploadImage(w http.ResponseWriter, r *http.Request) {
	mimetype := r.Header.Get("Content-Type")
	if Accepted := utility.CanImageBeAccepted(r, mimetype); !Accepted.Ok {
		http.Error(w, Accepted.Msg, Accepted.Code)
		return
	}

	img, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	compress, compErr := utility.AutoCompress(mimetype, img)
	if compErr != nil {
		http.Error(w, compErr.Error(), http.StatusInternalServerError)
		return
	}

	ID := uuid.New()
	zipped, err := utility.GZipBytes(compress)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	_, resultErr := srv.Exec("INSERT INTO Images (url, content, mimetype) VALUES (?, ?, ?)", ID.String(), zipped, mimetype)
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
