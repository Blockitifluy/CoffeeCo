package api

import (
	"hash/fnv"
	"path/filepath"

	"github.com/gabriel-vasile/mimetype"
)

type FileMime struct {
	file  []byte
	mtype string
}

func hash(s string) uint32 {
	h := fnv.New32a()
	h.Write([]byte(s))
	return h.Sum32()
}

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

func i32tob(val uint32) []byte {
	r := make([]byte, 4)
	for i := uint32(0); i < 4; i++ {
		r[i] = byte((val >> (8 * i)) & 0xff)
	}
	return r
}

func btoi32(val []byte) uint32 {
	r := uint32(0)
	for i := uint32(0); i < 4; i++ {
		r |= uint32(val[i]) << (8 * i)
	}
	return r
}
