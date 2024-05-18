package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"hash/fnv"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

// LoginUser is used for login users and contains:
//
//   - Handle
//   - Password (hasn't been hashed yet)
type LoginUser struct {
	Handle   string `json:"handle"`   // A unique name of the User
	Password string `json:"password"` // Unhashed password
}

// PublicUser is the root of most User structs contains non-personal information about the user
type PublicUser struct {
	Username       string `json:"username"`       // A non-unique name
	Handle         string `json:"handle"`         // An unique handle
	Bio            string `json:"bio"`            // The description (biography)
	FollowersCount int    `json:"followersCount"` // How many users following
	Banner         string `json:"Banner"`         // Url to the Banner
	Profile        string `json:"Profile"`        // Url to the Profile
}

// SentUser contains all the regular information from [coffeecoserver/api.PublicUser] as well as:
//
//   - Password
//   - Email
type SentUser struct {
	*PublicUser

	Password string `json:"password"` // unhashed password
	Email    string `json:"email"`
}

// User contains all the user information provided from the database
type User struct {
	*PublicUser

	password []byte // hashed password
	Email    string `json:"email"`
	Auth     string `json:"auth"` // Authorisation Token
}

func hashString(b []byte) uint32 {
	h := fnv.New32a()
	h.Write(b)
	return h.Sum32()
}

// GenerateAuth generates an auth token from the user
func (u *User) GenerateAuth() string {
	byteConverted := [][]byte{
		[]byte(u.Username),
		[]byte(u.Handle),
		[]byte(u.Email),
		u.password,
	}

	var combined []byte
	for _, v := range byteConverted {
		combined = append(combined, v...)
	}

	hashed := fmt.Sprintf("%o", hashString(combined))

	return hashed
}

// IDToUser get the ID from the User
func (srv *Server) IDToUser(ID int) (*User, error) {
	res := srv.QueryRow("SELECT FROM Users WHERE id = ?", ID)

	var user User

	if err := res.Scan(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

// AuthToID is the non-api version of APIAuthToID
func (srv *Server) AuthToID(auth string) (int, error) {
	response := srv.QueryRow("SELECT id AS ID FROM Users WHERE auth = ?", auth)

	var ID int

	if err := response.Scan(&ID); err != nil {
		return 0, err
	}

	return ID, nil
}

// APIUserFromID is an api call. Doesn't work as expected when called outside an API context
//
// Get a user based on the id given via url.
func (srv *Server) APIUserFromID(w http.ResponseWriter, r *http.Request) {
	id, idErr := strconv.Atoi(mux.Vars(r)["id"])

	if idErr != nil {
		http.Error(w, idErr.Error(), http.StatusBadRequest)
		return
	}

	response := srv.QueryRow("SELECT username, handle, followersCount, Banner, Profile, bio FROM Users WHERE id = ?", id)

	type UFIUser struct {
		Username       string `json:"username"`
		Handle         string `json:"handle"`
		FollowersCount int    `json:"followersCount"`
		Banner         string `json:"Banner"`
		Profile        string `json:"Profile"`
		Bio            string `json:"bio"`
	}

	var u UFIUser

	if err := response.Scan(&u.Username, &u.Handle, &u.FollowersCount, &u.Banner, &u.Profile, &u.Bio); err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "no rows found", http.StatusBadRequest)
			return
		}

		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json, jsonErr := json.Marshal(u)
	if jsonErr != nil {
		http.Error(w, jsonErr.Error(), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(json)
}

// APIAddUser is an api call. Doesn't work as expected when called outside an API context
//
// Add user using the SentUser struct
func (srv *Server) APIAddUser(w http.ResponseWriter, r *http.Request) {
	var user SentUser

	decoder := json.NewDecoder(r.Body)
	bodyErr := decoder.Decode(&user)

	if bodyErr != nil {
		http.Error(w, bodyErr.Error(), http.StatusBadRequest)
		return
	}

	hashedPass := I32toB(hashString([]byte(user.Password)))

	var hashedUser User = User{
		PublicUser: user.PublicUser,

		password: hashedPass,
		Email:    user.Email,
	}

	nowDate := time.Now()

	_, execErr := srv.Exec("INSERT INTO Users (username, handle, password, email, timeCreated, auth) VALUES (?, ?, ?, ?, ?, ?)", hashedUser.Username, hashedUser.Handle, hashedUser.password, hashedUser.Email, nowDate, hashedUser.GenerateAuth())

	if execErr != nil {
		http.Error(w, execErr.Error(), http.StatusBadRequest)
		return
	}
}

// APIAuthToID is an api call. Doesn't work as expected when called outside an API context
//
// Get a user's id using authorisation token via url
func (srv *Server) APIAuthToID(w http.ResponseWriter, r *http.Request) {

	sentAuth := mux.Vars(r)["auth"]

	response := srv.QueryRow("SELECT id AS Id FROM Users WHERE auth = ?", sentAuth)

	var ID int

	if err := response.Scan(&ID); err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "no rows found", http.StatusBadRequest)
			return
		}

		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	b := fmt.Sprintf(`{"Id": %d}`, ID)

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(b))
}

// APILoginUser is an api call. Doesn't work as expected when called outside an API context
//
// Logs in user via password and username
func (srv *Server) APILoginUser(w http.ResponseWriter, r *http.Request) {
	var Req LoginUser

	if err := json.NewDecoder(r.Body).Decode(&Req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := srv.QueryRow("SELECT password, auth FROM Users WHERE handle = ?", Req.Handle)

	var (
		password []byte
		auth     string
	)

	if err := response.Scan(&password, &auth); err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "no rows found", http.StatusBadRequest)
			return
		}

		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	hashedPass := I32toB(hashString([]byte(Req.Password)))
	if string(hashedPass) != string(password) {
		http.Error(w, "password incorrect", http.StatusBadRequest)
		return
	}

	const maxAge int = 365 * 24 * 60 * 60

	cookie := &http.Cookie{
		Name:   "AuthToken",
		Value:  auth,
		MaxAge: maxAge,
		Path:   "/",
	}

	http.SetCookie(w, cookie)
	w.Write([]byte("Auth Cookie added successfully"))
}