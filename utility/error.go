package utility

import (
	"encoding/json"
	"net/http"
)

const (
	PublicBadRequest    = "Something Went Wrong With your Request"
	PublicServerError   = "Something Went Wrong"
	PublicNotFoundError = "Nothing was Found"
)

// HTTPError is a special json and more detailed
type HTTPError struct {
	Public  string `json:"public"`  // The public error shown in the writer
	Message string `json:"message"` // The more detailed message
	Code    int    `json:"-"`       // The HTTP code
}

// IsOk checks if an http code stored by a HTTPError is ok
func (err HTTPError) IsOk() bool {
	return 200 > err.Code && err.Code >= 300
}

// Error writes the HTTPError to the writer
func Error(w http.ResponseWriter, sentErr HTTPError) {
	json, err := json.Marshal(sentErr)
	if err != nil {
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(sentErr.Code)
	w.Write(json)
}
