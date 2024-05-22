package api

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/Blockitifluy/CoffeeCo/utility"
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

	Address string
	Debug   bool
}

// RouteTemplate is a server route, not yet loaded by the server
type RouteTemplate struct {
	path    string
	Methods []string
	Funct   http.HandlerFunc
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
			Funct:   srv.APIUserFromID,
		},
		{
			path:    "/api/user/auth-to-id/{auth}",
			Methods: []string{"GET"},
			Funct:   srv.APIAuthToID,
		},
		{
			path:    "/api/user/log-in",
			Methods: []string{"POST"},
			Funct:   srv.APILoginUser,
		},
		{
			path:    "/api/user/add",
			Methods: []string{"POST"},
			Funct:   srv.APIAddUser,
		},

		// POST API
		{
			path:    "/api/post/get-comments-from-post",
			Methods: []string{"GET"},
			Funct:   srv.APIGetCommentsFromPost,
		},
		{
			path:    "/api/post/get-post-from-id/{ID}",
			Methods: []string{"GET"},
			Funct:   srv.APIGetPostFromID,
		},
		{
			path:    "/api/post/feedlist/{amount}",
			Methods: []string{"GET"},
			Funct:   srv.APIPostFeedList,
		},
		{
			path:    "/api/post/feed",
			Methods: []string{"GET"},
			Funct:   srv.APIPostFeed,
		},
		{
			path:    "/api/post/add",
			Methods: []string{"POST"},
			Funct:   srv.APIAddPost,
		},
		{
			path:    "/api/post/get-posts-from-user",
			Methods: []string{"GET"},
			Funct:   srv.APIGetPostsFromUser,
		},

		// Image API
		{
			path:    "/api/images/upload",
			Methods: []string{"POST"},
			Funct:   srv.APIUploadImage,
		},
		{
			path:    "/api/images/download/{url}",
			Methods: []string{"GET"},
			Funct:   srv.APIDownloadImage,
		},
	}
}

var openedCache map[string]*utility.FileMime = map[string]*utility.FileMime{}

// NewServer creates a server with the database and routes added
func NewServer(address string, debug bool) *Server {
	db, err := sql.Open("sqlite3", os.Getenv("DB_PATH"))
	if err != nil {
		color.Red("Database could't be initalised: %s", err.Error())
		os.Exit(1)
	}

	srv := &Server{
		Router:  mux.NewRouter(),
		DB:      db,
		Address: address,
		Debug:   debug,
	}

	srv.InitTable()

	srv.Routes()
	color.Cyan("\nServer Created\nRoutes Created\n\n")

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

		if srv.Debug {
			fmt.Printf("> %s\n", rout.path)
		}
	}

	srv.LoadAssets()
}

// Run runs the server
func (srv *Server) Run() {
	fmt.Printf("Hosting on port %s\nPress Ctrl + C to stop server\n\n", srv.Address)

	err := http.ListenAndServe(srv.Address, srv)

	if err != nil {
		color.Red(err.Error())
		os.Exit(1)
	}
}

// LoadAssets loads asset urls
func (srv *Server) LoadAssets() {
	const weekLength int = 2 * 7 * 24 * int(time.Hour)

	HTMLOptions := ConstantFileOptions{
		Path:   os.Getenv("HTML_PATH"),
		Mime:   "text/html",
		MaxAge: weekLength,
	}

	HTMLMethod := srv.ConstantFile(HTMLOptions)
	for _, path := range srv.getHTMLRoutes() {
		if srv.Debug {
			fmt.Printf("> %s\n", path)
		}
		srv.HandleFunc(path, HTMLMethod).Methods("GET")
	}

	ManifestOptions := ConstantFileOptions{
		Path:   "manifest.json",
		Mime:   "application/json",
		MaxAge: weekLength,
	}
	srv.HandleFunc("/manifest.json", srv.ConstantFile(ManifestOptions)).
		Methods("GET")
	srv.HandleFunc("/assets/{filename}", srv.AssetFiles).
		Methods("GET")
}

// AssetFiles is an api call. Doesn't work as expected when called outside an API context
//
// Sends files from `dist/assets` and caches it
func (srv *Server) AssetFiles(w http.ResponseWriter, r *http.Request) {
	const CacheControl string = "must-revalidate, private, max-age=604800" // Caches for one week

	fileName := mux.Vars(r)["filename"]
	cache := openedCache[fileName]

	if cache != nil { // Cache exists
		w.Header().Set("Cache-Control", CacheControl)
		w.Header().Set("Content-Type", cache.Mime)
		w.Header().Set("Content-Encoding", "gzip")
		w.Write(cache.File)
		return
	}

	path := os.Getenv("ASSETS_PATH") + fileName
	if !utility.DoesFileExist(path) {
		http.Error(w, "file path doesn't exist", http.StatusBadRequest)
		return
	}

	newCache := createAssetCache(fileName)
	if newCache.Err != nil {
		http.Error(w, newCache.Err.Error(), newCache.Code)
		return
	}

	w.Header().Set("Content-Encoding", "gzip")
	w.Header().Set("Cache-Control", CacheControl)
	w.Header().Set("Content-Type", newCache.File.Mime)
	w.Write(newCache.File.File)
}

type assetCache struct {
	File *utility.FileMime
	Code int
	Err  error
}

// createAssetCache should only be used by [coffeecoserver/api.AssetFile],
// when a asset file (in cache) doesn't exists, then create one and return it
func createAssetCache(fileName string) assetCache {
	path := os.Getenv("ASSETS_PATH") + fileName // Example: dist/assets/hello.world
	if !utility.IsFileValid(fileName) {
		return assetCache{
			File: nil,
			Code: http.StatusBadRequest,
			Err:  errors.New("Invalid File Name"),
		}
	}

	read, readErr := os.ReadFile(path)

	mtype := utility.MimeExpection(mimetype.Detect(read), path)
	if readErr != nil {
		return assetCache{
			File: nil,
			Code: 500,
			Err:  readErr,
		}
	}

	compress, err := utility.GZipBytes(read)
	if err != nil {
		return assetCache{
			File: nil,
			Code: 500,
			Err:  err,
		}
	}

	FileData := &utility.FileMime{
		Mime: mtype,
		File: compress,
	}

	openedCache[fileName] = FileData

	return assetCache{
		File: FileData,
		Code: 200,
		Err:  nil,
	}
}

// ConstantFileOptions is for the method [github.com/Blockitifluy/CoffeeCo/api.ConstantFile]
type ConstantFileOptions struct {
	Path   string
	Mime   string
	MaxAge int
}

// ConstantFile is an api call. Doesn't work as expected when called outside an API context
//
// First, reads and caches file then sends to client
func (srv *Server) ConstantFile(Options ConstantFileOptions) http.HandlerFunc {
	const CacheControl string = "must-revalidate, private, max-age=604800" // Caches for one week
	read, readErr := os.ReadFile(Options.Path)
	if readErr != nil {
		color.Red("Error: `%s` can't be found; Server will not start (%s)", Options.Path, readErr.Error())
		os.Exit(1)
	}

	compress, err := utility.GZipBytes(read)
	if err != nil {
		color.Red("Error: '%s' couldn't be compressed; Server will not start")
		os.Exit(1)
	}

	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", Options.Mime)
		w.Header().Set("Content-Encoding", "gzip")
		w.Header().Set("Cache-Control", CacheControl)
		w.Write(compress)
	}
}
