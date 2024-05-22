package main

import (
	"flag"
	"os"

	"github.com/Blockitifluy/CoffeeCo/api"

	"github.com/fatih/color"
	"github.com/joho/godotenv"
)

func loadEnv() {
	err := godotenv.Load()
	if err != nil {
		color.Red("Couldn't load env variables: %s", err.Error())
		os.Exit(1)
	}
	return
}

func main() {
	loadEnv()

	var (
		port  string
		debug bool
	)

	flag.StringVar(&port, "port", os.Getenv("DEFAULT_PORT"), "The hosted port")
	flag.BoolVar(&debug, "debug", false, "Debugs the server")

	flag.Parse()

	srv := api.NewServer(port, debug)
	defer srv.Close() // Closes until the script ends
	srv.Run()
}
