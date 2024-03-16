package main

import (
	"coffeecoserver/src/api"
	"fmt"
	"net/http"
)

func main() {
	const PORT string = ":8000"

	fmt.Printf("Hosting on port %s\n", PORT)

	srv := api.NewServer()

	http.ListenAndServe(PORT, srv)
}
