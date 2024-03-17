package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

type LoginUser struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type PublicUser struct {
	Username       string `json:"username"`
	Handle         string `json:"handle"`
	Bio            string `json:"bio"`
	FollowersCount int    `json:"followersCount"`
	Banner         string `json:"Banner"`
	Profile        string `json:"Profile"`
}

type SentUser struct {
	*PublicUser

	Password string `json:"password"`
	Email    string `json:"email"`
}

type User struct {
	*PublicUser

	password []byte
	Email    string `json:"email"`
	Auth     string `json:"auth"`
}

func (u *User) GenerateAuth() string {
	var (
		byteUser          = []byte(u.Username)
		byteHandle        = []byte(u.Handle)
		byteEmail  []byte = []byte(u.Email)
	)

	// Byte train
	combined := append(byteUser, append(byteHandle, append(byteEmail, u.password...)...)...)

	hashed := fmt.Sprintf("%o", hash(string(combined)))

	return hashed
}

func (s *Server) ApiUserFromId() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		id, idErr := strconv.Atoi(mux.Vars(r)["id"])

		if idErr != nil {
			http.Error(w, idErr.Error(), http.StatusBadRequest)
			return
		}

		response := s.QueryRow("SELECT username, handle, followersCount, Banner, Profile, bio FROM Users WHERE id = ? LIMIT 1", id)

		var (
			username       string
			handle         string
			followersCount int
			Banner         string
			Profile        string
			bio            string
		)

		if err := response.Scan(&username, &handle, &followersCount, &Banner, &Profile, &bio); err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "no rows found", http.StatusBadRequest)
				return
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		b := fmt.Sprintf(`{
			"username": "%s",
			"handle": "%s",
			"followersCount": %d,
			"Banner": "%s",
			"Profile": "%s",
			"bio": "%s"
		}`, username, handle, followersCount, Banner, Profile, bio)

		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(b))
	}
}

func (s *Server) ApiAddUser() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var user SentUser

		decoder := json.NewDecoder(r.Body)
		bodyErr := decoder.Decode(&user)

		if bodyErr != nil {
			http.Error(w, bodyErr.Error(), http.StatusBadRequest)
			return
		}

		hashedPass := i32tob(hash(user.Password))

		var hashedUser User = User{
			PublicUser: user.PublicUser,

			password: hashedPass,
			Email:    user.Email,
		}

		nowDate := time.Now()

		_, execErr := s.Exec("INSERT INTO Users (username, handle, password, email, timeCreated, auth) VALUES (?, ?, ?, ?, ?, ?)", hashedUser.Username, hashedUser.Handle, hashedUser.password, hashedUser.Email, nowDate, hashedUser.GenerateAuth())

		if execErr != nil {
			http.Error(w, execErr.Error(), http.StatusBadRequest)
			return
		}
	}
}

func (s *Server) ApiAuthToId() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sentAuth := mux.Vars(r)["auth"]

		response := s.QueryRow("SELECT id AS Id FROM Users WHERE auth = ?", sentAuth)

		var Id int

		if err := response.Scan(&Id); err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "no rows found", http.StatusBadRequest)
				return
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		b := fmt.Sprintf(`{"Id": %d}`, Id)

		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(b))
	}
}

func (s *Server) LoginUser() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var loginRequest LoginUser

		decoder := json.NewDecoder(r.Body)

		if err := decoder.Decode(&loginRequest); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		response := s.QueryRow("SELECT password, auth FROM Users WHERE username = ?", loginRequest.Username)

		var password []byte
		var auth string

		if err := response.Scan(&password, &auth); err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "no rows found", http.StatusBadRequest)
				return
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		hashedPass := i32tob(hash(loginRequest.Password))
		if string(hashedPass) != string(password) {
			http.Error(w, "password incorrect", http.StatusBadRequest)
			return
		}

		expire := time.Now().Add(365 * 24 * time.Hour) // A year
		cookie := http.Cookie{
			Name:    "SessionToken",
			Value:   auth,
			Expires: expire,
		}

		http.SetCookie(w, &cookie)
	}
}
