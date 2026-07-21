package main

import (
	"io/fs"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

func loadPost(f *file) {
	layoutPath := filepath.Join(f.config.postsDir, "_layout.html")
	layout := f.config.getLayout(layoutPath)
	path := f.src

	postDate, postUrl, postFilesDir := parsePostFilename(path)
	dest := filepath.Join(f.config.output, postUrl)
	fileContent, err := os.ReadFile(path)
	check(err)

	buf, meta := parsePostMarkdown(f.config.markdownParser, fileContent)

	f.FilesDir = postFilesDir
	f.Url = postUrl
	f.Date = postDate
	f.dest = dest
	f.src = path
	f.Content = buf
	f.Title = meta.Title
	f.Tags = meta.Tags
	f.Type = FiletypePost
	f.layout = layout

	// Parse liquid within markdown post
	content, err := f.config.liquidEngine.ParseAndRender(buf, map[string]any{"post": *f})
	check(err)

	f.Content = content

	// Parse the page's layout and liquid templates
	page, err := f.config.liquidEngine.ParseAndRender(layout.Content, map[string]any{"post": *f})
	check(err)

	f.Content = page
}

func addPosts(config *gomiConfig) {
	if !directoryExists(config.postsDir) {
		return
	}

	layoutPath := filepath.Join(config.postsDir, "_layout.html")
	config.loadLayout(layoutPath)

	filepath.WalkDir(config.postsDir, func(path string, d fs.DirEntry, err error) error {
		check(err)

		if d.IsDir() || !isPost(path, *config) {
			return nil
		}

		config.files = append(config.files, &file{src: path, Type: FiletypePost, config: config})

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
