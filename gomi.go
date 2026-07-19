package main

import (
	"os"

	"github.com/alexflint/go-arg"
	"github.com/charmbracelet/log"
	_ "github.com/joho/godotenv/autoload"
)

type args struct {
	WorkDir         string `arg:"positional"`
	Input           string `arg:"-i,env:GOMI_INPUT"`
	Output          string `arg:"-o,env:GOMI_OUTPUT"`
	HighlightTheme  string `arg:"env:GOMI_HIGHLIGHT_THEME"`
	SiteUrl         string `arg:"env:SITE_URL"`
	SiteDescription string `arg:"env:SITE_DESCRIPTION"`
	SiteName        string `arg:"env:SITE_NAME"`
}

func (args) Version() string {
	return "0.0.1"
}

func (args) Description() string {
	return "Hello World"
}

func main() {
	var args args
	arg.MustParse(&args)

	if len(args.WorkDir) > 0 {
		log.Info("WD Changed", "WD", args.WorkDir)
		os.Chdir(args.WorkDir)
	}

	config := NewGomiConfig(args)

	config.liquidEngine = newLiquidEngine()
	config.markdownParser = newMarkdownParser(config.highlightTheme)

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
