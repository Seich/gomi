package main

import (
	"errors"
	"io/fs"
	"os"
	"path/filepath"

	"github.com/charmbracelet/log"
	_ "github.com/joho/godotenv/autoload"
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

func main() {
	input := os.Getenv("GOMI_INPUT")
	output := os.Getenv("GOMI_OUTPUT")
	highlightTheme := os.Getenv("GOMI_HIGHLIGHT_THEME")
	siteUrl := os.Getenv("SITE_URL")
	siteDescription := os.Getenv("SITE_DESCRIPTION")
	siteName := os.Getenv("SITE_NAME")

	postsDir := filepath.Join(input, "_posts")
	photosDir := filepath.Join(input, "_photos")

	config := gomiConfig{
		input:           input,
		output:          output,
		highlightTheme:  highlightTheme,
		siteUrl:         siteUrl,
		siteDescription: siteDescription,
		siteName:        siteName,
		postsDir:        postsDir,
		photosDir:       photosDir,
	}

	if _, err := os.Stat(input); errors.Is(err, fs.ErrNotExist) {
		log.Fatal("Input directory does not exist.")
	}

	config.liquidEngine = newLiquidEngine()
	config.markdownParser = newMarkdownParser(highlightTheme)

	config.posts = loadPosts(config)
	config.photos = loadPhotos(config)

	filesToCopy, pages := loadPages(config)
	config.filesToCopy = filesToCopy
	config.pages = pages

	copyFiles(config.filesToCopy)
	copyFiles(config.photos)

	writeFiles(config, config.posts)
	writeFiles(config, config.pages)

	generateBlogFeed(config)
}
