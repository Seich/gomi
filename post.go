package main

import (
	"errors"
	"io/fs"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

func loadPost(config gomiConfig, path string) *file {
	layoutTemplate := []byte("{{ content }}")

	layoutTemplate, err := os.ReadFile(filepath.Join(config.postsDir, "_layout.html"))
	if err != nil && !errors.Is(err, os.ErrNotExist) {
		check(err)
	}

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
		Type:     FiletypePost,
	}

	// Parse liquid within markdown post
	content, err := config.liquidEngine.ParseAndRender(buf, map[string]any{"post": post})
	check(err)

	post.Content = content

	// Parse the page's layout and liquid templates
	page, err := config.liquidEngine.ParseAndRender(layoutTemplate, map[string]any{"post": post})
	check(err)

	post.Content = page

	return &post
}

func loadPosts(config *gomiConfig) {
	if !directoryExists(config.postsDir) {
		return
	}

	filepath.WalkDir(config.postsDir, func(path string, d fs.DirEntry, err error) error {
		check(err)

		if d.IsDir() || !isPost(path, *config) {
			return nil
		}

		post := loadPost(*config, path)
		config.files = append(config.files, post)

		return nil
	})

}

func isPost(path string, config gomiConfig) bool {
	return isPathInside(path, config.postsDir) && strings.HasSuffix(path, ".md")
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
