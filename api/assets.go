package api

import (
	"errors"
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"time"

	"github.com/Blockitifluy/CoffeeCo/utility"
	"github.com/fatih/color"
	"github.com/gabriel-vasile/mimetype"
	"github.com/gorilla/mux"
)

const assetCacheControl string = "must-revalidate, max-age=86400" // Caches for one day

var openedCache = map[string]*AssetCache{}

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
	fileName := mux.Vars(r)["filename"]
	cache := openedCache[fileName]

	if cache != nil { // Cache exists
		srv.SendAssetsFile(w, r, *cache)
		return
	}

	path := os.Getenv("ASSETS_PATH") + fileName
	if !utility.DoesFileExist(path) {
		utility.Error(w, utility.HTTPError{
			Public:  "File doesn't exist",
			Message: "file path doesn't exist",
			Code:    400,
		})
		return
	}

	newCache := createAssetCache(fileName)
	if newCache.Err != nil {
		utility.Error(w, utility.HTTPError{
			Public:  "Couldn't get file",
			Message: newCache.Err.Error(),
			Code:    newCache.Code,
		})
		return
	}

	srv.SendAssetsFile(w, r, newCache)
}

// SendAssetsFile sends the AssetCache to the client
func (srv *Server) SendAssetsFile(w http.ResponseWriter, r *http.Request, Data AssetCache) {
	match := r.Header.Get("If-None-Match")
	ifModifiedSince := r.Header.Get("If-Modified-Since")

	if match != "" {
		if match == Data.ETag {
			w.WriteHeader(http.StatusNotModified)
			return
		}
	}

	if ifModifiedSince != "" {
		t, err := time.Parse(http.TimeFormat, ifModifiedSince)
		if err == nil && Data.FileInfo.ModTime().Before(t.Add(1*time.Second)) {
			w.WriteHeader(http.StatusNotModified)
			return
		}
	}

	lastMod := utility.GetFileLastModified(Data.FileInfo)

	w.Header().Set("Content-Encoding", "gzip")
	w.Header().Set("Cache-Control", assetCacheControl)
	w.Header().Set("ETag", Data.ETag)
	w.Header().Set("Last-Modified", lastMod)
	w.Header().Set("Content-Type", Data.File.Mime)
	w.Write(Data.File.Content)
}

// AssetCache is represents the Asset stored in the Cache
type AssetCache struct {
	File     *utility.FileMime // The filedata
	FileInfo fs.FileInfo       // The file metadata
	Err      error             // The Error being return (optional)
	Code     int               // The code being returned
	ETag     string            // The file's ETag
}

// createAssetCache should only be used by [coffeecoserver/api.AssetFile],
// when a asset file (in cache) doesn't exists, then create one and return it
func createAssetCache(fileName string) AssetCache {
	path := os.Getenv("ASSETS_PATH") + fileName // Example: dist/assets/hello.world
	if !utility.IsFileValid(fileName) {
		return AssetCache{
			File: nil,
			Code: http.StatusBadRequest,
			Err:  errors.New("Invalid File Name"),
		}
	}

	read, readErr := os.ReadFile(path)

	mtype := utility.MimeExpection(mimetype.Detect(read), path)
	if readErr != nil {
		return AssetCache{
			File: nil,
			Code: 500,
			Err:  readErr,
		}
	}

	compress, err := utility.GZipBytes(read)
	if err != nil {
		return AssetCache{
			File: nil,
			Code: 500,
			Err:  err,
		}
	}

	fileInfo, err := os.Stat(path)
	if err != nil {
		return AssetCache{
			File: nil,
			Code: 500,
			Err:  err,
		}
	}

	eTag, err := utility.GenerateETag(read)
	if err != nil {
		return AssetCache{
			File: nil,
			Code: 500,
			Err:  err,
		}
	}

	FileData := &utility.FileMime{
		Mime:    mtype,
		Content: compress,
	}

	Cache := AssetCache{
		File:     FileData,
		Err:      nil,
		Code:     200,
		FileInfo: fileInfo,
		ETag:     eTag,
	}

	openedCache[fileName] = &Cache

	return Cache
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
	const CacheControl string = "must-revalidate, public, max-age=604800" // Caches for one week
	read, readErr := os.ReadFile(Options.Path)
	if readErr != nil {
		color.Red("'%s' can't be found; Server will not start (%s)", Options.Path, readErr.Error())
		os.Exit(1)
	}

	compress, err := utility.GZipBytes(read)
	if err != nil {
		color.Red("'%s' couldn't be compressed; Server will not start", Options.Path)
		os.Exit(1)
	}

	eTag, err := utility.GenerateETag(compress)
	if err != nil {
		color.Red("'%s' couldn't get ETag; Server will not start", Options.Path)
		os.Exit(1)
	}

	fileInfo, err := os.Stat(Options.Path)
	if err != nil {
		color.Red("'%s' couldn't get file info", Options.Path)
		os.Exit(1)
	}

	return func(w http.ResponseWriter, r *http.Request) {

		if match := r.Header.Get("If-None-Match"); match != "" {
			if match == eTag {
				w.WriteHeader(http.StatusNotModified)
				return
			}
		}

		if ifModifiedSince := r.Header.Get("If-Modified-Since"); ifModifiedSince != "" {
			t, err := time.Parse(http.TimeFormat, ifModifiedSince)
			if err == nil && fileInfo.ModTime().Before(t.Add(1*time.Second)) {
				w.WriteHeader(http.StatusNotModified)
				return
			}
		}

		w.Header().Set("Content-Type", Options.Mime)
		w.Header().Set("Content-Encoding", "gzip")
		w.Header().Set("Cache-Control", CacheControl)
		w.Write(compress)
	}
}
