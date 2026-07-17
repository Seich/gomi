package main

import "github.com/charmbracelet/log"

func check(err error) {
	if err != nil {
		log.Fatal(err)
	}
}
