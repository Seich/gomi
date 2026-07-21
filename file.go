package main

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/charmbracelet/log"
)

type FileType int

const (
	FiletypeCopy FileType = iota
	FiletypePost
	FiletypePage
	FiletypePhoto
	FiletypeLayout
)

var fileTypeNames = map[FileType]string{
	FiletypeCopy:  "copy",
	FiletypePage:  "page",
	FiletypePost:  "post",
	FiletypePhoto: "photo",
}

func (ft FileType) String() string {
	return fileTypeNames[ft]
}

type file struct {
	src  string
	dest string

	Title   string
	Content []byte
	Tags    []string

	Url          string
	ThumbnailUrl string
	Date         time.Time
	FilesDir     string

	Ancestors []*file
	Siblings  []*file
	Children  []*file

	Type FileType

	layout *file
	config *gomiConfig
}

func (file *file) load() *file {
	switch file.Type {
	case FiletypePost:
		loadPost(file)
	case FiletypePage:
		loadPage(file)
	case FiletypePhoto:
		loadPhoto(file)
	case FiletypeLayout:
		file.config.loadLayout(file.src)
	}

	return file
}

func (file *file) write() {
	switch file.Type {
	case FiletypeCopy, FiletypePhoto:
		file.copyToDest()
	case FiletypePost, FiletypePage:
		file.writeFile(file.config)
	}
}

func (file *file) writeFile(config *gomiConfig) {
	layoutTemplate, err := os.ReadFile(filepath.Join(config.input, "_layout.html"))
	check(err)

	ensureDirectoryExists(file.dest)

	f, err := os.OpenFile(file.dest, os.O_CREATE|os.O_RDWR|os.O_TRUNC, os.ModePerm)
	check(err)

	bindings := map[string]any{
		"site": map[string]any{
			"name":        config.siteName,
			"description": config.siteDescription,
			"url":         config.siteUrl,
			"posts":       config.Posts(),
			"photos":      config.Photos(),
		},
		"page": file,
	}

	fileContent := string(file.Content)

	if config.hot {
		fileContent = fileContent + "<script src=\"http://localhost:35729/livereload.js\"></script>"
	}

	layout := strings.Replace(string(layoutTemplate), "{{ content }}", fileContent, 1)

	page, err := config.liquidEngine.ParseAndRender([]byte(layout), bindings)
	if err != nil {
		page = []byte(err.Error())
		log.Warn(err)
	}

	n, err := f.Write(page)
	check(err)

	log.Info("Writing", "File", file.src, "To", file.dest, "Bytes", n)
}

func (file *file) copyToDest() {
	ensureDirectoryExists(file.dest)

	data, err := os.ReadFile(file.src)
	check(err)

	err = os.WriteFile(file.dest, data, os.ModePerm)
	check(err)

	log.Info("Copying", "File", file.src, "To", file.dest)
}

func (f *file) loadRelationships() {
	ancestorPath := filepath.Join(f.dest, "..", "..", "..")
	siblingsPath := filepath.Join(f.dest, "..", "..")
	childrenPath := filepath.Join(f.dest, "..")

	var ancestor []*file
	var siblings []*file
	var children []*file

	for _, p := range f.config.files {
		if filepath.Dir(p.dest) == f.config.output || p.Type != FiletypePage {
			continue
		}

		if pageIsInPath(p.dest, ancestorPath) {
			ancestor = append(ancestor, p)
		}

		if pageIsInPath(p.dest, siblingsPath) {
			siblings = append(siblings, p)
		}

		if pageIsInPath(p.dest, childrenPath) {
			children = append(children, p)
		}
	}

	f.Ancestors = ancestor
	f.Siblings = siblings
	f.Children = children
}

func findLayoutFor(config *gomiConfig, path string) *file {
	dir, _ := filepath.Split(path)

	for true {
		filename := filepath.Join(dir, "_layout.html")

		// Skip root layout
		if filename == filepath.Join(config.input, "_layout.html") {
			return nil
		}

		layout, err := config.loadLayout(filename)
		check(err)

		if layout != nil {
			return layout
		}

		dir = filepath.Join(dir, "..")

		// If root is reached, stop
		if !strings.HasPrefix(dir, config.input) {
			return nil
		}
	}
	return nil
}

func directoryExists(path string) bool {
	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		return false
	} else if err != nil {
		check(err)
	}

	return true
}

func ensureDirectoryExists(path string) {
	dir, _ := filepath.Split(path)
	err := os.MkdirAll(dir, os.ModePerm)
	check(err)
}

func isPathInside(child, parent string) bool {
	relation, err := filepath.Rel(parent, child)
	check(err)
	return relation != ".." && !strings.HasPrefix(relation, ".."+string(filepath.Separator)) && relation != filepath.Clean(parent)
}
