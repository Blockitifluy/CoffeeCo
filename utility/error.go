package utility

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

const (
	// PublicBadRequest is public message for 400
	PublicBadRequest = "Something Went Wrong With your Request"
	// PublicServerError is public message for 500
	PublicServerError = "Something Went Wrong"
	// PublicNotFoundError is public message for 404
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

// SendScanErr sends a special http error message when no rows found.
//
// By default the noRow is "Something Went Wrong With your Request"
func SendScanErr(w http.ResponseWriter, err error, noRow *string) {
	msg := PublicBadRequest
	if noRow != nil {
		msg = *noRow
	}

	if err == sql.ErrNoRows {
		Error(w, HTTPError{
			Public:  msg,
			Message: "no rows found",
			Code:    404,
		})
		return
	}

	Error(w, HTTPError{
		Public:  PublicServerError,
		Message: err.Error(),
		Code:    500,
	})
}
