package api

import (
	"bytes"
	"compress/gzip"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/fatih/color"
	"github.com/gabriel-vasile/mimetype"
	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3" // Used for a driver by database/sql
)

// Server contains:
//
//   - Server (Gorilla Mux),
//   - Database (Sqlite)
type Server struct {
	*mux.Router
	*sql.DB
}

// RouteTemplate is a server route, not yet loaded by the server
type RouteTemplate struct {
	path    string
	Methods []string
	Queries map[string]string
	Funct   http.HandlerFunc
}

var openedCache map[string]*FileMime = map[string]*FileMime{}

// NewServer creates a server with the database and routes added
func NewServer() *Server {
	db, err := sql.Open("sqlite3", os.Getenv("DB_PATH"))

	if err != nil {
		color.Red("Database could't be initalised: %s", err.Error())
		os.Exit(1)
	}

	srv := &Server{
		Router: mux.NewRouter(),
		DB:     db,
	}

	color.Cyan("Server Created\nRoutes Created\n\n")

	srv.InitTable()
	srv.Routes()

	return srv
}

// InitTable adds tables to the database if the database already has been initated
func (srv *Server) InitTable() {
	initRead, initErr := os.ReadFile(os.Getenv("DB_INIT"))
	read, _ := os.ReadFile(os.Getenv("DB_PATH"))

	if initErr != nil {
		color.Red("Database couldn't be read: %s", initErr.Error())
		os.Exit(1)
	} else if len(read) != 0 { // Hasn't been inited
		color.Green("Database has already been initialised\n\n")
		return
	}

	color.Green("Computing Database...\n")

	if _, err := srv.Exec(string(initRead)); err != nil {
		color.Red(err.Error())

		os.Exit(1)
	}

	fmt.Printf("Success!\n\n")
}

func (srv *Server) getHTMLRoutes() []string {
	return []string{
		"/user/{id}",
		"/new-post",
		"/sign-up",
		"/log-in",
		"/",
	}
}

func (srv *Server) getRouteTemplates() []RouteTemplate {
	return []RouteTemplate{
		// USER API
		{
			path:    "/api/user/get-user-from-id/{id}",
			Methods: []string{"GET"},
			Queries: map[string]string{},
			Funct:   srv.APIUserFromID,
		},
		{
			path:    "/api/user/auth-to-id/{auth}",
			Methods: []string{"GET"},
			Queries: map[string]string{},
			Funct:   srv.APIAuthToID,
		},
		{
			path:    "/api/user/log-in",
			Methods: []string{"POST"},
			Queries: map[string]string{},
			Funct:   srv.APILoginUser,
		},
		{
			path:    "/api/user/add",
			Methods: []string{"POST"},
			Queries: map[string]string{},
			Funct:   srv.APIAddUser,
		},

		// POST API
		{
			path:    "/api/post/get-comments-from-post",
			Methods: []string{"GET"},
			Queries: map[string]string{},
			Funct:   srv.APIGetCommentsFromPost,
		},
		{
			path:    "/api/post/get-post-from-id/{ID}",
			Methods: []string{"GET"},
			Queries: map[string]string{},
			Funct:   srv.APIGetPostFromID,
		},
		{
			path:    "/api/post/feedlist/{amount}",
			Methods: []string{"GET"},
			Queries: map[string]string{},
			Funct:   srv.APIPostFeedList,
		},
		{
			path:    "/api/post/feed",
			Methods: []string{"GET"},
			Queries: map[string]string{},
			Funct:   srv.APIPostFeed,
		},
		{
			path:    "/api/post/add",
			Methods: []string{"POST"},
			Queries: map[string]string{},
			Funct:   srv.APIAddPost,
		},
		{
			path:    "/api/post/get-posts-from-user",
			Methods: []string{"GET"},
			Queries: map[string]string{},
			Funct:   srv.APIGetPostsFromUser,
		},

		// Image API
		{
			path:    "/api/images/upload",
			Methods: []string{"POST"},
			Queries: map[string]string{},
			Funct:   srv.APIUploadImage,
		},
		{
			path:    "/api/images/download/{url}",
			Methods: []string{"GET"},
			Queries: map[string]string{},
			Funct:   srv.APIDownloadImage,
		},
	}
}

// Routes method adds routes to the server (Self explainitary)
func (srv *Server) Routes() {
	var Routes []RouteTemplate = srv.getRouteTemplates()

	for _, rout := range Routes {
		handle := srv.HandleFunc(rout.path, rout.Funct).
			Methods(rout.Methods...)

		if err := handle.GetError(); err != nil {
			color.Red("Couldn't load route %s: %s", rout.path, err.Error())
			os.Exit(1)
		}

		for name, pattern := range rout.Queries {
			handle.Queries(name, pattern)
		}

		// regex, _ := handle.GetPathRegexp()
		// queriesRegex, _ := handle.GetQueriesRegexp()

		fmt.Printf("> %s\n", rout.path)
	}

	srv.assetsRoutes()
}

func (srv *Server) assetsRoutes() {
	const weekLength int = 2 * 7 * 24 * int(time.Hour)

	HTMLMethod := srv.ConstantFile(os.Getenv("HTML_PATH"), "text/html", weekLength)
	for _, path := range srv.getHTMLRoutes() {
		fmt.Printf("> %s\n", path)
		srv.HandleFunc(path, HTMLMethod).Methods("GET")
	}

	srv.HandleFunc("/manifest.json", srv.ConstantFile("manifest.json", "application/json", weekLength)).Methods("GET")
	srv.HandleFunc("/assets/{filename}", srv.AssetFiles()).Methods("GET")
}

// AssetFiles is an api call. Doesn't work as expected when called outside an API context
//
// Sends files from `dist/assets` and caches it
func (srv *Server) AssetFiles() http.HandlerFunc {
	const CacheControl string = "must-revalidate, private, max-age=604800" // Caches for one week

	return func(w http.ResponseWriter, r *http.Request) {
		fileName := mux.Vars(r)["filename"]
		cache := openedCache[fileName]

		if cache != nil { // Cache exists

			w.Header().Set("Cache-Control", CacheControl)
			w.Header().Set("Content-Type", cache.mtype)
			w.Header().Set("Content-Encoding", "gzip")
			w.Write(cache.file)
			return
		}

		path := os.Getenv("ASSETS_PATH") + fileName

		if !DoesFileExist(path) {
			http.Error(w, "file path doesn't exist", http.StatusBadRequest)
			return
		}

		FileData, code, err := createAssetCache(fileName)

		if err != nil {
			http.Error(w, err.Error(), code)
			return
		}

		w.Header().Set("Content-Encoding", "gzip")
		w.Header().Set("Cache-Control", CacheControl)
		w.Header().Set("Content-Type", FileData.mtype)
		w.Write(FileData.file)
	}
}

func isFileValid(name string) bool {
	return !(strings.Contains(name, "/") || strings.Contains(name, "\\") || strings.Contains(name, ".."))
}

// createAssetCache should only be used by [coffeecoserver/api.AssetFile],
// when a asset file (in cache) doesn't exists, then create one and return it
func createAssetCache(fileName string) (*FileMime, int, error) {
	path := os.Getenv("ASSETS_PATH") + fileName // Example: dist/assets/hello.world

	if !isFileValid(fileName) {
		return nil, http.StatusBadRequest, errors.New("Invalid File Name")
	}

	read, readErr := os.ReadFile(path)

	mtype := MimeExpection(mimetype.Detect(read), path)
	if readErr != nil {
		return nil, http.StatusInternalServerError, readErr
	}

	var buffer bytes.Buffer
	gzipWriter := gzip.NewWriter(&buffer)
	gzipWriter.Write(read)
	gzipWriter.Close()

	FileData := &FileMime{
		mtype: mtype,
		file:  buffer.Bytes(),
	}

	openedCache[fileName] = FileData

	return FileData, 200, nil
}

// ConstantFile is an api call. Doesn't work as expected when called outside an API context
//
// First, reads and caches file then sends to client
func (srv *Server) ConstantFile(path string, mime string, maxAge int) http.HandlerFunc {
	read, readErr := os.ReadFile(path)

	if readErr != nil {
		color.Red("Error: `%s` can't be found; Server will not start (%s)", path, readErr.Error())
		os.Exit(1)
	}

	var buffer bytes.Buffer
	gzipWriter := gzip.NewWriter(&buffer)
	if _, err := gzipWriter.Write(read); err != nil {
		color.Red("Error: '%s' couldn't be compressed; Server will not start")
		os.Exit(1)
	}
	gzipWriter.Close()

	const CacheControl string = "must-revalidate, private, max-age=604800" // Caches for one week

	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", mime)
		w.Header().Set("Content-Encoding", "gzip")
		w.Header().Set("Cache-Control", CacheControl)
		w.Write(buffer.Bytes())
	}
}
