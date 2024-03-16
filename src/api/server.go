package api

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gabriel-vasile/mimetype"
	"github.com/gorilla/mux"
)

type FileMime struct {
	file  []byte
	mtype string
}

type Server struct {
	*mux.Router
}

func NewServer() *Server {
	s := &Server{
		Router: mux.NewRouter(),
	}
	s.Routes()
	return s
}

func (s *Server) Routes() {
	const IndexHtml string = "dist/index.html"

	for _, path := range []string{"/", "/users/{id}", "/sign-up", "/log-in"} {
		s.HandleFunc(path, s.ConstantFile(IndexHtml, map[string]string{"Content-Type": "text/html"})).Methods("GET")
	}

	s.HandleFunc("/manifest.json", s.ConstantFile("dist/manifest.json", map[string]string{"Content-Type": "application/json"}))
	s.HandleFunc("/assets/{filename}", s.AssetFiles()).Methods("GET")
}

func MimeExpection(mtype *mimetype.MIME, path string) string {
	extension := filepath.Ext(path)

	switch extension {
	case ".js":
		return "text/javascript"
	case ".css":
		return "text/css"
	default:
		return mtype.String()
	}
}

func (s *Server) AssetFiles() http.HandlerFunc {
	OpenedCache := map[string]*FileMime{}

	return func(w http.ResponseWriter, r *http.Request) {
		fileName := mux.Vars(r)["filename"]

		if OpenedCache[fileName] != nil { // Cache exists
			cache := OpenedCache[fileName]

			w.Header().Set("Content-Type", cache.mtype)
			w.Write(cache.file)
			return
		}

		path := "dist/assets/" + fileName

		readFile, readErr := os.ReadFile(path)
		if readErr != nil {
			http.Error(w, readErr.Error(), http.StatusNotFound)
			return
		}

		mtype := MimeExpection(mimetype.Detect(readFile), path)

		OpenedCache[fileName] = &FileMime{
			mtype: mtype,
			file:  readFile,
		}

		w.Header().Set("Content-Type", mtype)
		w.Write(readFile)
	}
}

func (s *Server) ConstantFile(path string, headers map[string]string) http.HandlerFunc {
	read, readErr := os.ReadFile(path)

	if readErr != nil {
		fmt.Printf("Warning: `%s` can't be found", path)
	}

	return func(w http.ResponseWriter, r *http.Request) {
		if readErr != nil {
			http.Error(w, readErr.Error(), http.StatusNotFound) // 404
			return
		}

		for k, v := range headers {
			// Example: k = "Content-Type", v = "text/plain"
			w.Header().Set(k, v)
		}

		w.Write(read)
	}
}
