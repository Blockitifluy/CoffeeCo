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
	"github.com/blockloop/scan"
	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3" // Used for a driver by database/sql
)

// AddPostRequest struct should be used for request for adding a new Post in the database
type AddPostRequest struct {
	PostedBy int    `json:"postedBy" db:"PostedBy"`
	Content  string `json:"content" db:"content"`
	ParentID int    `json:"parentID" db:"ParentId"`
	Images   string `json:"images" db:"images"`
}

// PostDB is a struct replicata of the `Posts` table
type PostDB struct {
	ID          int       `json:"ID" db:"id"`
	PostedBy    int       `json:"postedBy" db:"PostedBy"`
	Content     string    `json:"content" db:"content"`
	TimeCreated time.Time `json:"timeCreated" db:"timeCreated"`
	ParentID    int       `json:"parentID" db:"ParentId"`
	// Images list format seperated with commas: url (alt)
	Images string `json:"images" db:"images"`
}

// PostListBody is used by [coffeecoserver/api.server.PostFeedList] and only contains Amount int value.
type PostListBody struct {
	Amount int `json:"amount"`
}

type postFeed struct {
	Post *PostDB
	Code int
}

// getFeed gets a random Post from the DB.
// This is used by PostFeedList and PostFeed
func (srv *Server) getFeed(query string) (postFeed, error) {
	rows, err := srv.Query(query)
	if err != nil {
		return postFeed{
			Post: nil,
			Code: 500,
		}, err
	}
	defer rows.Close()

	var Posts []PostDB
	if err := scan.Rows(&Posts, rows); err != nil {
		if err == sql.ErrNoRows {
			return postFeed{
				Post: nil,
				Code: 400,
			}, errors.New("No rows found")
		}

		return postFeed{
			Post: nil,
			Code: 500,
		}, err
	}

	if len(Posts) == 0 {
		return postFeed{
			Post: nil,
			Code: 500,
		}, errors.New("Empty Array")
	}

	if err := rows.Err(); err != nil {
		return postFeed{
			Post: nil,
			Code: 500,
		}, err
	}

	var RandPost PostDB = utility.GetRandFromSlice(Posts)
	return postFeed{
		Post: &RandPost,
		Code: 200,
	}, nil
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

	var Posts []PostDB
	if err := scan.Rows(&Posts, querys); err != nil {
		utility.SendScanErr(w, err)
		return
	}

	if len(Posts) == 0 {
		http.Error(w, "Empty Array", http.StatusInternalServerError)
		return
	}

	JSON, JSONErr := json.Marshal(Posts)
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

	query, err := srv.Query("SELECT * FROM Posts WHERE id = ?", ID)
	if err != nil {
		http.Error(w, query.Err().Error(), http.StatusInternalServerError)
		return
	}

	var pst PostDB
	if err := scan.Row(&pst, query); err != nil {
		utility.SendScanErr(w, err)
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
		Feed, err := srv.getFeed("SELECT * FROM Posts WHERE ParentId = -1")
		if err != nil {
			http.Error(w, err.Error(), Feed.Code)
			return
		}
		Posts = append(Posts, *Feed.Post)
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
	Feed, err := srv.getFeed("SELECT * FROM Posts WHERE ParentId = -1")
	if err != nil {
		http.Error(w, err.Error(), Feed.Code)
		return
	}

	PostsJSON, err := json.Marshal(Feed.Post)
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

		Feed, err := srv.getFeed(queryStr)

		if err != nil {
			utility.SendScanErr(w, err)
			return
		}

		Posts = append(Posts, *Feed.Post)
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
