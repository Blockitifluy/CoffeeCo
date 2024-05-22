package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/Blockitifluy/CoffeeCo/api"

	"github.com/fatih/color"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	args := os.Args[1:] // Removes the command string

	var port string = os.Getenv("DEFAULT_PORT") // Port arguement
	if len(args) == 1 && args[0] != "" {
		color.Green("Arguements have changed the port to %s; unexpected changes may happen.\n", args[0])
		port = ":" + args[0]
	}

	fmt.Printf("\nHosting on port %s\n", port)
	fmt.Printf("Press Ctrl + C to stop server\n\n")

	srv := api.NewServer()
	defer srv.Close() // Closes until the script ends

	err := http.ListenAndServe(port, srv)

	if err != nil {
		color.Red(err.Error())
		os.Exit(1)
	}
}
