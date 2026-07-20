package main

import (
	"errors"
	"io/fs"
	"net/url"
	"os"
	"path/filepath"
	"slices"
	"time"

	"github.com/charmbracelet/log"
	"github.com/gorilla/feeds"
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

	files   []*file
	fileMap map[string]*file

	liquidEngine   *liquid.Engine
	markdownParser goldmark.Markdown
}

func (config *gomiConfig) Load() {
	loadPages(config)
	loadPosts(config)
	loadPhotos(config)
	config.fileMap = make(map[string]*file)
	for _, file := range config.files {
		file.load()
		config.fileMap[file.src] = file
	}
}

func (config *gomiConfig) GenerateBlogFeed() {
	var items []*feeds.Item

	for _, post := range config.Posts() {
		postUrl, err := url.JoinPath(config.siteUrl, post.Url)
		check(err)
		items = append(items, &feeds.Item{
			Title:       post.Title,
			Link:        &feeds.Link{Href: postUrl},
			Description: string(post.Content),
			IsPermaLink: "true",
			Created:     post.Date,
		})
	}

	feed := &feeds.Feed{
		Title:       config.siteName,
		Link:        &feeds.Link{Href: config.siteUrl},
		Description: config.siteDescription,
		Author:      &feeds.Author{},
		Updated:     time.Now(),
		Items:       items,
	}

	rss, err := feed.ToRss()
	check(err)

	feedPath := filepath.Join(config.output, "feed.xml")
	err = os.WriteFile(feedPath, []byte(rss), 0644)
	check(err)

	log.Info("Generated", "Feed", feedPath)
}

func (config *gomiConfig) WriteAll() {
	for _, file := range config.files {
		if file.dest == "" {
			log.Warn("Emitting file not possible", "file", file.src)
			continue
		}
		file.write()
	}
}

func (config *gomiConfig) Photos() []file {
	var posts []file
	for _, file := range config.files {
		if file.Type == FiletypePhoto {
			posts = append(posts, *file)
		}
	}

	slices.SortFunc(posts, func(a, b file) int {
		return b.Date.Compare(a.Date)
	})

	return posts
}

func (config *gomiConfig) Posts() []file {
	var posts []file
	for _, file := range config.files {
		if file.Type == FiletypePost {
			posts = append(posts, *file)
		}
	}

	slices.SortFunc(posts, func(a, b file) int {
		return b.Date.Compare(a.Date)
	})

	return posts
}

func NewGomiConfig(args args) *gomiConfig {
	postsDir := filepath.Join(args.Input, "_posts")
	photosDir := filepath.Join(args.Input, "_photos")

	if _, err := os.Stat(args.Input); errors.Is(err, fs.ErrNotExist) {
		log.Fatal("Input directory does not exist.")
	}

	gomi := &gomiConfig{
		input:           args.Input,
		output:          args.Output,
		highlightTheme:  args.HighlightTheme,
		siteUrl:         args.SiteUrl,
		siteDescription: args.SiteDescription,
		siteName:        args.SiteName,
		postsDir:        postsDir,
		photosDir:       photosDir,
		liquidEngine:    newLiquidEngine(),
		markdownParser:  newMarkdownParser(args.HighlightTheme),
	}

	gomi.Load()
	gomi.WriteAll()
	gomi.GenerateBlogFeed()

	return gomi
}
