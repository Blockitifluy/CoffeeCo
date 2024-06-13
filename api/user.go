package api

import (
	"encoding/json"
	"fmt"
	"hash/fnv"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/Blockitifluy/CoffeeCo/utility"
	"github.com/blockloop/scan"
	"github.com/gorilla/mux"
)

// LoginUser is used for login users and contains:
//
//   - Handle
//   - Password (hasn't been hashed yet)
type LoginUser struct {
	Handle   string `json:"handle" db:"handle"` // A unique name of the User
	Password string `json:"password"`           // Unhashed password
}

// PublicUser is the root of most User structs contains non-personal information about the user
type PublicUser struct {
	ID          int    `json:"ID" db:"ID"`
	Username    string `json:"username" db:"username"` // A non-unique name
	Handle      string `json:"handle" db:"handle"`     // An unique handle
	Bio         string `json:"bio" db:"bio"`           // The description (biography)
	Followers   int    `json:"followers" db:"followers"`
	WhoFollowed string `json:"whoFollowed" db:"whoFollowed"` // How many users following
	Banner      string `json:"Banner" db:"banner"`           // Url to the Banner
	Profile     string `json:"Profile" db:"profile"`         // Url to the Profile
}

// SentUser contains all the regular information from [coffeecoserver/api.PublicUser] as well as:
//
//   - Password
//   - Email
type SentUser struct {
	*PublicUser

	Password string `json:"password"` // unhashed password
	Email    string `json:"email" db:"email"`
}

// User contains all the user information provided from the database
type User struct {
	*PublicUser

	password []byte `db:"password"` // hashed password
	Email    string `json:"email" db:"email"`
	Auth     string `json:"auth" db:"auth"` // Authorisation Token
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
	res, err := srv.Query("SELECT * FROM Users WHERE id = ?", ID)
	if err != nil {
		return nil, err
	}

	var user User
	if err := scan.Row(user, res); err != nil {
		return nil, err
	}

	return &user, nil
}

// AuthToID is the non-api version of APIAuthToID
func (srv *Server) AuthToID(auth string) (int, error) {
	rows, err := srv.Query("SELECT id AS ID FROM Users WHERE auth = ?", auth)
	if err != nil {
		return 0, err
	}

	var ID int
	if err := scan.Row(&ID, rows); err != nil {
		return 0, err
	}

	return ID, nil
}

// APIUserFromID is an api call. Doesn't work as expected when called outside an API context
//
// Get a user based on the id given via url.
func (srv *Server) APIUserFromID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utility.Error(w, utility.HTTPError{
			Public:  utility.PublicBadRequest,
			Message: err.Error(),
			Code:    400,
		})
		return
	}

	rows, err := srv.Query("SELECT * FROM Users WHERE id = ?", id)
	if err != nil {
		utility.SendScanErr(w, err, nil)
		return
	}

	var u PublicUser
	if err := scan.Row(&u, rows); err != nil {
		utility.SendScanErr(w, err, nil)
		return
	}

	json, err := json.Marshal(u)
	if err != nil {
		utility.Error(w, utility.HTTPError{
			Public:  "No User Found",
			Message: err.Error(),
			Code:    500,
		})
		return
	}

	w.Header().Set("Cache-Control", fmt.Sprintf("max-age=%d", utility.MinuteCache))
	w.Header().Set("Content-Type", "application/json")
	w.Write(json)
}

// APIAddUser is an api call. Doesn't work as expected when called outside an API context
//
// Add user using the SentUser struct
func (srv *Server) APIAddUser(w http.ResponseWriter, r *http.Request) {
	var user SentUser
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&user)
	if err != nil {
		utility.Error(w, utility.HTTPError{
			Public:  utility.PublicBadRequest,
			Message: err.Error(),
			Code:    400,
		})
		return
	}

	if len(user.Handle) > 24 {
		utility.Error(w, utility.HTTPError{
			Public:  "Username Too Long (24 limit)",
			Message: "Username to long",
			Code:    400,
		})
		return
	}

	hashedPass := utility.I32toB(hashString([]byte(user.Password)))

	var hashedUser User = User{
		PublicUser: user.PublicUser,

		password: hashedPass,
		Email:    user.Email,
	}

	nowDate := time.Now()

	var Options []any = []any{
		hashedUser.Username,
		hashedUser.Handle,
		hashedUser.password,
		hashedUser.Email,
		nowDate,
		hashedUser.GenerateAuth(),
	}
	_, execErr := srv.Exec("INSERT INTO Users (username, handle, password, email, timeCreated, auth) VALUES (?, ?, ?, ?, ?, ?)", Options...)

	if execErr != nil {
		utility.Error(w, utility.HTTPError{
			Public:  "Unable to Add User",
			Message: execErr.Error(),
			Code:    400,
		})
		return
	}
}

// APIAuthToID is an api call. Doesn't work as expected when called outside an API context
//
// Get a user's id using authorisation token via url
func (srv *Server) APIAuthToID(w http.ResponseWriter, r *http.Request) {
	sentAuth := mux.Vars(r)["auth"]

	row := srv.QueryRow("SELECT id FROM Users WHERE auth = ?", sentAuth)
	if row.Err() != nil {
		utility.Error(w, utility.HTTPError{
			Public:  utility.PublicServerError,
			Message: row.Err().Error(),
			Code:    500,
		})
		return
	}

	var ID int
	if err := row.Scan(&ID); err != nil {
		utility.SendScanErr(w, err, nil)
		return
	}

	w.Header().Set("Content-Type", "text/text")
	w.Write([]byte(fmt.Sprintf("%d", ID)))
}

// APILoginUser is an api call. Doesn't work as expected when called outside an API context
//
// Logs in user via password and username
func (srv *Server) APILoginUser(w http.ResponseWriter, r *http.Request) {
	var Req LoginUser

	if err := json.NewDecoder(r.Body).Decode(&Req); err != nil {
		utility.Error(w, utility.HTTPError{
			Public:  utility.PublicBadRequest,
			Message: err.Error(),
			Code:    400,
		})
		return
	}

	response := srv.QueryRow("SELECT password, auth FROM Users WHERE handle = ?", Req.Handle)

	var (
		password []byte
		auth     string
	)

	if err := response.Scan(&password, &auth); err != nil {
		var sendErr string = "Couldn't find User"
		utility.SendScanErr(w, err, &sendErr)
		return
	}

	hashedPass := utility.I32toB(hashString([]byte(Req.Password)))
	if string(hashedPass) != string(password) {
		utility.Error(w, utility.HTTPError{
			Public:  "Incorrect Password",
			Message: "password wrong",
			Code:    401,
		})
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

// APISearchForUsers is an api call. Doesn't work as expected when called outside an API context
//
// Searches user by username and handle (Feed Type)
func (srv *Server) APISearchForUsers(w http.ResponseWriter, r *http.Request) {
	URLQuery := r.URL.Query()
	name, err := url.QueryUnescape(URLQuery.Get("name"))
	if err != nil {
		utility.Error(w, utility.HTTPError{
			Public:  utility.PublicBadRequest,
			Message: err.Error(),
			Code:    400,
		})
		return
	}

	from, err := strconv.Atoi(URLQuery.Get("from"))
	if err != nil {
		utility.Error(w, utility.HTTPError{
			Public:  utility.PublicBadRequest,
			Message: "Couldn't parse from",
			Code:    400,
		})
		return
	}

	userRange, err := strconv.Atoi(URLQuery.Get("range"))
	if err != nil {
		utility.Error(w, utility.HTTPError{
			Public:  utility.PublicBadRequest,
			Message: "Couldn't range from",
			Code:    400,
		})
		return
	}

	const Query = `
	SELECT * FROM Users
	WHERE lower(handle) LIKE lower(?) OR
	lower(username) LIKE lower(?)
	ORDER BY id ASC
	LIMIT ? OFFSET ?
	`

	formatedName := fmt.Sprintf("%%%s%%", name)

	rows, err := srv.Query(Query, formatedName, formatedName, userRange, from)
	if err != nil {
		utility.Error(w, utility.HTTPError{
			Public:  utility.PublicServerError,
			Message: err.Error(),
			Code:    500,
		})
		return
	}

	var Users []PublicUser
	if err := scan.Rows(&Users, rows); err != nil {
		utility.SendScanErr(w, err, nil)
		return
	}

	if len(Users) == 0 {
		utility.Error(w, utility.HTTPError{
			Public:  utility.PublicNotFoundError,
			Message: "no rows found",
			Code:    404,
		})
		return
	}

	JSON, err := json.Marshal(Users)
	if err != nil {
		utility.Error(w, utility.HTTPError{
			Public:  utility.PublicServerError,
			Message: err.Error(),
			Code:    500,
		})
		return
	}

	zipped, err := utility.GZipBytes(JSON)
	if err != nil {
		utility.Error(w, utility.HTTPError{
			Public:  utility.PublicServerError,
			Message: err.Error(),
			Code:    500,
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Content-Encoding", "gzip")
	w.Write(zipped)
}
