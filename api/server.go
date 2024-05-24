package api

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"

	"github.com/Blockitifluy/CoffeeCo/utility"
	"github.com/fatih/color"
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

func (srv *Server) notFound() http.HandlerFunc {
	NotFoundError := utility.HTTPError{
		Public:  "Method Couldn't Be Found",
		Message: "Page/Method not found",
		Code:    404,
	}

	return func(w http.ResponseWriter, r *http.Request) {
		utility.Error(w, NotFoundError)
	}
}

func (srv *Server) methodNotAllowed() http.HandlerFunc {
	MethodNotAllowedError := utility.HTTPError{
		Public:  "Method was incorrect",
		Message: "Illegal method for route",
		Code:    405,
	}

	return func(w http.ResponseWriter, r *http.Request) {
		utility.Error(w, MethodNotAllowedError)
	}
}

// Routes method adds routes to the server (Self explainitary)
func (srv *Server) Routes() {
	var Routes []RouteTemplate = srv.getRouteTemplates()

	srv.NotFoundHandler = srv.notFound()
	color.Cyan("NotFound Method loaded")

	srv.MethodNotAllowedHandler = srv.methodNotAllowed()
	color.Cyan("IllegalMethod Method loaded")

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
