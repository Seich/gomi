package main

import (
	"io/fs"
	"os"
	"path/filepath"
	"slices"
	"strings"
)

func loadPage(page *file) {
	dest := strings.Replace(page.src, filepath.Clean(page.config.input), "", 1)
	dest = filepath.Join(filepath.Clean(page.config.output), dest)
	fileContent, err := os.ReadFile(page.src)
	check(err)

	page.dest = dest
	page.Content = fileContent

	if isMarkdownFile(page.src) {
		buf, meta := parsePostMarkdown(page.config.markdownParser, fileContent)
		page.Title = meta.Title
		page.Tags = meta.Tags
		page.dest = strings.Replace(page.dest, ".md", ".html", 1)

		if page.layout != nil {
			buf = []byte(strings.Replace(string(page.layout.Content), "{{ content }}", string(buf), 1))
		}

		page.Content = buf
	}

	check(err)

	page.Url = page.dest[len(page.config.output):]
	page.Content = []byte(strings.Replace(string(page.Content), "{{ content }}", string(page.Content), 1))
	page.Type = FiletypePage
}

func addPages(config *gomiConfig) {
	layout := filepath.Join(config.input, "_layout.html")
	config.loadLayout(layout)

	filepath.WalkDir(config.input, func(path string, d fs.DirEntry, err error) error {
		check(err)

		if d.IsDir() {
			// _drafts, _posts, etc...
			if strings.HasPrefix(d.Name(), "_") {
				return fs.SkipDir
			}

			return nil
		}

		// hidden files and folders
		if strings.HasPrefix(d.Name(), ".") || strings.HasPrefix(d.Name(), "_") {
			return nil
		}

		layout := findLayoutFor(config, path)
		f := file{src: path, Type: FiletypePage, config: config, layout: layout}

		if shouldBeCopied(path) {
			dest := strings.Replace(path, filepath.Clean(config.input), "", 1)
			dest = filepath.Join(filepath.Clean(config.output), dest)
			f.dest = dest
			f.Type = FiletypeCopy
		}

		config.files = append(config.files, &f)

		return nil
	})
}

func isMarkdownFile(path string) bool {
	return filepath.Ext(path) == ".md"
}

func shouldBeCopied(path string) bool {
	extensions := []string{".html", ".xml", ".md"}
	ext := filepath.Ext(path)
	shouldBePreprocessed := slices.Contains(extensions, ext)

	return !shouldBePreprocessed
}

func pageIsInPath(file, path string) bool {
	return strings.HasPrefix(file, path) && strings.Count(file[len(path):], "/") == 2
}
