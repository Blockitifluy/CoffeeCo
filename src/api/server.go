package api

import (
	"bytes"
	"compress/gzip"
	"database/sql"
	"fmt"
	"net/http"
	"os"

	"github.com/fatih/color"
	"github.com/gabriel-vasile/mimetype"
	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
)

type Server struct {
	*mux.Router
	*sql.DB
}

const (
	dbPath   string = "src/api/database/db.sql"
	initPath string = "src/api/database/TableInit.txt"
)

func NewServer() *Server {
	db, err := sql.Open("sqlite3", dbPath)

	if err != nil {
		color.Red("Database could't be initalised: %s", err.Error())
		os.Exit(1)
	}

	s := &Server{
		Router: mux.NewRouter(),
		DB:     db,
	}

	color.Cyan("Server Created\nRoutes Created\n\n")

	s.InitTable()

	s.Routes()
	return s
}

func (s *Server) InitTable() {
	initRead, initErr := os.ReadFile(initPath)
	read, _ := os.ReadFile(dbPath)

	if len(read) != 0 { // Hasn't been inited
		color.Green("Database has already been initialised\n")
		return
	}

	color.Green("Computing Database...\n")

	if initErr != nil {
		color.Red("Database couldn't be read")
		os.Exit(1)
	}

	_, setErr := s.Exec(string(initRead))

	if setErr != nil {
		color.Red(setErr.Error())

		os.Exit(1)
	}

	fmt.Printf("Success!\n")
}

func (s *Server) Routes() {
	const IndexHtml string = "dist/index.html"

	for _, path := range []string{"/", "/users/{id}", "/sign-up", "/log-in"} {
		s.HandleFunc(path, s.ConstantFile(IndexHtml, "text/html")).Methods("GET")
	}

	s.HandleFunc("/api/user/get-user-from-id/{id}", s.ApiUserFromId()).Methods("GET")
	s.HandleFunc("/api/user/add", s.ApiAddUser()).Methods("POST")
	s.HandleFunc("/api/user/auth-to-id/{auth}", s.ApiAuthToId()).Methods("GET")
	s.HandleFunc("/api/user/log-in", s.LoginUser()).Methods("POST")

	s.HandleFunc("/manifest.json", s.ConstantFile("dist/manifest.json", "application/json"))
	s.HandleFunc("/assets/{filename}", s.AssetFiles()).Methods("GET")
}

func (s *Server) AssetFiles() http.HandlerFunc {
	OpenedCache := map[string]*FileMime{}

	return func(w http.ResponseWriter, r *http.Request) {
		fileName := mux.Vars(r)["filename"]

		if OpenedCache[fileName] != nil { // Cache exists
			cache := OpenedCache[fileName]

			w.Header().Set("Content-Type", cache.mtype)
			w.Header().Set("Content-Encoding", "gzip")
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

		var b bytes.Buffer
		gw := gzip.NewWriter(&b)
		gw.Write(readFile)
		gw.Close()

		OpenedCache[fileName] = &FileMime{
			mtype: mtype,
			file:  b.Bytes(),
		}

		w.Header().Set("Content-Encoding", "gzip")
		w.Header().Set("Content-Type", mtype)
		w.Write(b.Bytes())
	}
}

func (s *Server) ConstantFile(path string, mime string) http.HandlerFunc {
	read, readErr := os.ReadFile(path)

	if readErr != nil {
		color.Yellow("Warning: `%s` can't be found", path)
	}

	return func(w http.ResponseWriter, r *http.Request) {
		if readErr != nil {
			http.Error(w, readErr.Error(), http.StatusNotFound) // 404
			return
		}

		w.Header().Set("Content-Type", mime)
		w.Write(read)
	}
}
