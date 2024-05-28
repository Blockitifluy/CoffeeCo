package utility

import (
	"bytes"
	"compress/gzip"
	"errors"
	"math/rand"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gabriel-vasile/mimetype"
)

const (
	// HourCache caches for an hour
	HourCache int = int(time.Hour)
	// MinuteCache caches for a minute
	MinuteCache int = int(time.Minute)
)

// IsFileValid Checks if a file is legal based on it's url
func IsFileValid(name string) bool {
	return !(strings.Contains(name, "/") || strings.Contains(name, "\\") || strings.Contains(name, ".."))
}

// FileMime contains a file (bytes) and a mimetype (Content-Type)
type FileMime struct {
	Content []byte
	Mime    string
}

// GZipBytes compress a byte array using GZip
func GZipBytes(content []byte) ([]byte, error) {
	var b bytes.Buffer
	gw := gzip.NewWriter(&b)
	_, err := gw.Write(content)
	gw.Close()

	return b.Bytes(), err
}

// GetRandFromSlice gets an random element from a slice
func GetRandFromSlice[t any](slice []t) t {
	length := len(slice)

	randomPosition := rand.Intn(length)

	return slice[randomPosition]
}

// DoesFileExist check if the file (provided by path) exists using [os.Stat]
func DoesFileExist(path string) bool {
	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		return false
	}

	return true
}

// MimeExpection changes the mime based on path extension
func MimeExpection(mtype *mimetype.MIME, path string) string {
	extension := filepath.Ext(path)

	switch extension {
	case ".js":
		return "text/javascript"
	case ".css":
		return "text/css"
	default:
		return mtype.String()
	}
}

// I32toB converts uint32 to bytes
func I32toB(val uint32) []byte {
	r := make([]byte, 4)
	for i := uint32(0); i < 4; i++ {
		r[i] = byte((val >> (8 * i)) & 0xff)
	}
	return r
}

// BtoI32 converts bytes to uint32
func BtoI32(val []byte) uint32 {
	r := uint32(0)
	for i := uint32(0); i < 4; i++ {
		r |= uint32(val[i]) << (8 * i)
	}
	return r
}
