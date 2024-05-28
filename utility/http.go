package utility

import (
	"bytes"
	"crypto/sha1"
	"fmt"
	"io"
	"io/fs"
	"net/http"
)

// GenerateETag generates an ETag from content
func GenerateETag(content []byte) (string, error) {
	var b bytes.Buffer

	b.Write(content)

	hash := sha1.New()
	if _, err := io.Copy(hash, &b); err != nil {
		return "", err
	}

	return fmt.Sprintf(`"%x`, hash.Sum(nil)), nil
}

// GetFileLastModified gets when a file has been last modified
func GetFileLastModified(fileInfo fs.FileInfo) string {
	return fileInfo.ModTime().UTC().Format(http.TimeFormat)
}
