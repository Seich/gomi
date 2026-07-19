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

	layout := strings.Replace(string(layoutTemplate), "{{ content }}", string(file.Content), 1)

	page, err := config.liquidEngine.ParseAndRender([]byte(layout), bindings)
	check(err)

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

func findLayoutFor(config gomiConfig, path string) []byte {
	dir, _ := filepath.Split(path)

	for true {
		filename := filepath.Join(dir, "_layout.html")

		// Skip root layout
		if filename == filepath.Join(config.input, "_layout.html") {
			return nil
		}

		file, err := os.Stat(filename)
		if !errors.Is(err, os.ErrNotExist) {
			check(err)
		}

		if file != nil {
			layout, err := os.ReadFile(filename)
			check(err)
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
