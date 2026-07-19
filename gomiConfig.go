package main

import (
	"errors"
	"io/fs"
	"os"
	"path/filepath"

	"github.com/charmbracelet/log"
	"github.com/osteele/liquid"
	"github.com/yuin/goldmark"
)

type gomiConfig struct {
	input           string
	output          string
	highlightTheme  string
	siteUrl         string
	siteDescription string
	siteName        string
	postsDir        string
	photosDir       string

	posts       []file
	photos      []file
	filesToCopy []file
	pages       []file

	liquidEngine   *liquid.Engine
	markdownParser goldmark.Markdown
}

func NewGomiConfig(args args) gomiConfig {
	postsDir := filepath.Join(args.Input, "_posts")
	photosDir := filepath.Join(args.Input, "_photos")

	if _, err := os.Stat(args.Input); errors.Is(err, fs.ErrNotExist) {
		log.Fatal("Input directory does not exist.")
	}

	return gomiConfig{
		input:           args.Input,
		output:          args.Output,
		highlightTheme:  args.HighlightTheme,
		siteUrl:         args.SiteUrl,
		siteDescription: args.SiteDescription,
		siteName:        args.SiteName,
		postsDir:        postsDir,
		photosDir:       photosDir,
	}
}
