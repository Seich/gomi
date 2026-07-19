package main

import (
	"errors"
	"io/fs"
	"net/url"
	"os"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/charmbracelet/log"
	"github.com/gorilla/feeds"
)

func loadPost(config gomiConfig, path string, layoutTemplate []byte) file {
	postDate, postUrl, postFilesDir := parsePostFilename(path)
	dest := filepath.Join(config.output, postUrl)
	fileContent, err := os.ReadFile(path)
	check(err)

	buf, meta := parsePostMarkdown(config.markdownParser, fileContent)

	post := file{
		FilesDir: postFilesDir,
		Url:      postUrl,
		Date:     postDate,
		dest:     dest,
		src:      path,
		Content:  buf,
		Title:    meta.Title,
		Tags:     meta.Tags,
	}

	// Parse liquid within markdown post
	content, err := config.liquidEngine.ParseAndRender(buf, map[string]any{"post": post})
	check(err)

	post.Content = content

	// Parse the page's layout and liquid templates
	page, err := config.liquidEngine.ParseAndRender(layoutTemplate, map[string]any{"post": post})
	check(err)

	post.Content = page

	return post
}

func loadPosts(config gomiConfig) []file {
	layoutTemplate := []byte("{{ content }}")

	layoutTemplate, err := os.ReadFile(filepath.Join(config.postsDir, "_layout.html"))
	if err != nil && !errors.Is(err, os.ErrNotExist) {
		check(err)
	}

	var postFiles []file

	if _, err := os.Stat(config.postsDir); errors.Is(err, os.ErrNotExist) {
		return postFiles
	}

	filepath.WalkDir(config.postsDir, func(path string, d fs.DirEntry, err error) error {
		check(err)

		if d.IsDir() {
			return nil
		}

		if !strings.HasSuffix(path, ".md") {
			return nil
		}

		post := loadPost(config, path, layoutTemplate)

		postFiles = append(postFiles, post)
		return nil
	})

	slices.SortFunc(postFiles, func(a, b file) int {
		return b.Date.Compare(a.Date)
	})

	return postFiles
}

type postMeta struct {
	Title  string   `yaml:"title"`
	Tags   []string `yaml:"tags"`
	Layout string   `yaml:"layout"`
}

// Splits the filename into two components
// the date becomes the path while the rest of the components becomes the filename
// 2026-01-01-filename.md -> 2026/01/01/filename.html
// It also builds the path for the post's file directory from these
func parsePostFilename(path string) (time.Time, string, string) {
	_, file := filepath.Split(path)
	pieces := strings.Split(file, "-")

	year, err := strconv.Atoi(pieces[0])
	check(err)

	month, err := strconv.Atoi(pieces[1])
	check(err)

	day, err := strconv.Atoi(pieces[2])
	check(err)

	time := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)

	pathName, err := url.JoinPath("", pieces[0:3]...)
	check(err)

	fileName := strings.Replace(strings.Join(pieces[3:], "-"), ".md", ".html", 1)
	url, err := url.JoinPath("/", pathName, fileName)
	check(err)

	filesDir := filepath.Join("files", strings.Replace(file, ".md", "", 1))

	return time, url, filesDir
}

func generateBlogFeed(config gomiConfig) string {
	var items []*feeds.Item

	for _, post := range config.posts {
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

	return rss
}
