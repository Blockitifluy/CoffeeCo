package main

import (
	"coffeecoserver/src/api"
	"fmt"
	"net/http"
	"os"

	"github.com/fatih/color"
)

const DefaultPort string = ":8000"

func main() {

	args := os.Args[1:] // Removes the command string

	var port string = DefaultPort // Port arguement
	if len(args) == 1 && args[0] != "" {
		color.Green("Arguements have changed the port to %s; unexpected changes may happen.\n", args[0])
		port = ":" + args[0]
	}

	fmt.Printf("\nHosting on port %s\n", port)
	fmt.Printf("Press Ctrl + C to stop server\n\n")

	srv := api.NewServer()
	defer srv.Close() // Closes until the script ends

	http.ListenAndServe(port, srv)

}
