package api

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/Blockitifluy/CoffeeCo/utility"
	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3" // Used for a driver by database/sql
)

// AddPostRequest struct should be used for request for adding a new Post in the database
type AddPostRequest struct {
	PostedBy int    `json:"postedBy"`
	Content  string `json:"content"`
	ParentID int    `json:"parentID"`
	Images   string `json:"images"`
}

// PostDB is a struct replicata of the `Posts` table
type PostDB struct {
	ID          int       `json:"ID"`
	PostedBy    int       `json:"postedBy"`
	Content     string    `json:"content"`
	TimeCreated time.Time `json:"timeCreated"`
	ParentID    int       `json:"parentID"`
	// Images list format seperated with commas: url (alt)
	Images string `json:"images"`
}

// PostListBody is used by [coffeecoserver/api.server.PostFeedList] and only contains Amount int value.
type PostListBody struct {
	Amount int `json:"amount"`
}

// getFeed gets a random Post from the DB.
// This is used by PostFeedList and PostFeed
func (srv *Server) getFeed(query string) (*PostDB, int, error) {
	rows, err := srv.Query(query)
	if err != nil {
		return nil, 500, err
	}
	defer rows.Close()

	var Posts []PostDB
	for rows.Next() {
		var pst PostDB
		if scanerr := rows.Scan(&pst.ID, &pst.PostedBy, &pst.Content, &pst.TimeCreated, &pst.ParentID, &pst.Images); scanerr != nil {
			return nil, 500, scanerr
		}
		Posts = append(Posts, pst)
	}

	if len(Posts) == 0 {
		return nil, 500, errors.New("Empty Array")
	}

	if err := rows.Err(); err != nil {
		return nil, 500, err
	}

	var RandPost PostDB = utility.GetRandFromSlice(Posts)
	return &RandPost, 200, nil
}

func (srv *Server) isPostAllowed(Post AddPostRequest, r *http.Request) (bool, string) {
	const maxLength = 100
	if len(Post.Content) > maxLength {
		return false, "Post is too long"
	}

	authToken, err := r.Cookie("AuthToken")

	if err != nil {
		return false, "Couldn't read cookie"
	}

	ID, err := srv.AuthToID(authToken.Value)

	if Post.PostedBy != ID {
		return false, "Invalid user"
	}

	if Post.Content == "" {
		return false, "No content"
	}

	if Post.ParentID == 0 || Post.PostedBy == 0 {
		return false, "ParentID or PostBy is null"
	}

	return true, "Success"
}

// APIGetCommentsFromPost is an API call, only use in HTTP contexts
//
// Get a the comment from a Post
func (srv *Server) APIGetCommentsFromPost(w http.ResponseWriter, r *http.Request) {
	URLQuery := r.URL.Query()
	ID, IDErr := strconv.Atoi(URLQuery.Get("ID"))
	amount, amountErr := strconv.Atoi(URLQuery.Get("amount"))

	if IDErr != nil {
		http.Error(w, IDErr.Error(), http.StatusBadRequest)
		return
	} else if amountErr != nil {
		http.Error(w, amountErr.Error(), http.StatusBadRequest)
		return
	}

	querys, queryErr := srv.Query("SELECT * FROM Posts WHERE ParentId = ? LIMIT ?", ID, amount)
	defer querys.Close()
	if queryErr != nil {
		http.Error(w, queryErr.Error(), http.StatusInternalServerError)
		return
	}

	var posts []PostDB
	for querys.Next() {
		var pst PostDB
		if err := querys.Scan(&pst.ID, &pst.PostedBy, &pst.Content, &pst.TimeCreated, &pst.ParentID, &pst.Images); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		posts = append(posts, pst)
	}

	if len(posts) == 0 {
		http.Error(w, "Empty Array", http.StatusInternalServerError)
		return
	}

	JSON, JSONErr := json.Marshal(posts)
	if JSONErr != nil {
		http.Error(w, JSONErr.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(JSON)
}

// APIGetPostFromID is an API call, only use in HTTP contexts
//
// Get a post based on the ID given
func (srv *Server) APIGetPostFromID(w http.ResponseWriter, r *http.Request) {
	URLParams := mux.Vars(r)
	ID, IDErr := strconv.Atoi(URLParams["ID"])
	if IDErr != nil {
		http.Error(w, IDErr.Error(), http.StatusBadRequest)
		return
	}

	query := srv.QueryRow("SELECT * FROM Posts WHERE id = ?", ID)
	if query.Err() != nil {
		http.Error(w, query.Err().Error(), http.StatusInternalServerError)
		return
	}

	var pst PostDB
	if err := query.Scan(&pst.ID, &pst.PostedBy, &pst.Content, &pst.TimeCreated, &pst.ParentID, &pst.Images); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	JSON, JSONErr := json.Marshal(pst)
	if JSONErr != nil {
		http.Error(w, JSONErr.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(JSON)
}

// APIPostFeedList is an API call do not use outside of http requests
//
// This returns a list version of [coffeecoserver/api.Server.PostFeed]
func (srv *Server) APIPostFeedList(w http.ResponseWriter, r *http.Request) {
	URLParams := mux.Vars(r)
	amountString := URLParams["amount"]

	amount, amountErr := strconv.Atoi(amountString)
	if amountErr != nil {
		http.Error(w, amountErr.Error(), http.StatusBadRequest)
		return
	}

	var Posts []PostDB
	for i := 0; i < amount; i++ {
		Feed, code, err := srv.getFeed("SELECT * FROM Posts WHERE ParentId = -1")
		if err != nil {
			http.Error(w, err.Error(), code)
			return
		}
		Posts = append(Posts, *Feed)
	}

	PostsJSON, err := json.Marshal(Posts)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	compress, err := utility.GZipBytes(PostsJSON)
	if err != nil {
		http.Error(w, "Failed to Encode", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Encoding", "gzip")
	w.Header().Set("Content-Type", "application/json")
	w.Write(compress)
}

// APIPostFeed is an API call do not use outside of http requests
//
// This is a work in progress will change in the future
func (srv *Server) APIPostFeed(w http.ResponseWriter, r *http.Request) {
	Feed, code, err := srv.getFeed("SELECT * FROM Posts WHERE ParentId = -1")
	if err != nil {
		http.Error(w, err.Error(), code)
		return
	}

	PostsJSON, err := json.Marshal(Feed)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(PostsJSON)
}

// APIAddPost is an API call do not use outside of http requests
//
// Adds a post to database. See more at [coffeecoserver/api.AddPostRequest].
func (srv *Server) APIAddPost(w http.ResponseWriter, r *http.Request) {
	var RequestPost AddPostRequest
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&RequestPost); err != nil {
		http.Error(w, "Body can't be decoded", http.StatusBadRequest)
		return
	}

	postAllowed, reason := srv.isPostAllowed(RequestPost, r)
	if !postAllowed {
		http.Error(w, reason, http.StatusBadRequest)
		return
	}

	// Query Added

	_, err := srv.Exec("INSERT INTO Posts (PostedBy, Content, TimeCreated, ParentId, images) VALUES (?, ?, ?, ?, ?)", RequestPost.PostedBy, RequestPost.Content, time.Now(), RequestPost.ParentID, RequestPost.Images)

	if err != nil {
		http.Error(w, "DB had an error", http.StatusInternalServerError)
		fmt.Printf("DB error (%s)", err)
		return
	}

	w.Write([]byte("Success"))
}

// APIGetPostsFromUser is an API call do not use outside of http requests
//
// Gets a x amount of  Posts from a User (Provided by ID)
func (srv *Server) APIGetPostsFromUser(w http.ResponseWriter, r *http.Request) {
	Queries := r.URL.Query()
	userID, err := strconv.Atoi(Queries.Get("ID"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	amount, err := strconv.Atoi(Queries.Get("amount"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var Posts []PostDB
	for i := 0; i < amount; i++ {
		queryStr := fmt.Sprintf("SELECT * FROM Posts WHERE ParentId = -1 AND PostedBy = %d", userID)

		pst, code, err := srv.getFeed(queryStr)

		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "no rows found", http.StatusBadRequest)
				return
			}
			http.Error(w, err.Error(), code)
			return
		}

		Posts = append(Posts, *pst)
	}

	JSONPosts, err := json.Marshal(Posts)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	compress, err := utility.GZipBytes(JSONPosts)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Content-Encoding", "gzip")
	w.Write(compress)
}
