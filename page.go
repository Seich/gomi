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

		layout := findLayoutFor(*page.config, page.src)
		if layout != nil {
			buf = []byte(strings.Replace(string(layout), "{{ content }}", string(buf), 1))
		}

		page.Content = buf
	}

	check(err)

	page.Url = page.dest[len(page.config.output):]
	page.Content = []byte(strings.Replace(string(page.Content), "{{ content }}", string(page.Content), 1))
	page.Type = FiletypePage
}

func loadPages(config *gomiConfig) {
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

		f := file{src: path, Type: FiletypePage, config: config}

		if shouldBeCopied(path) {
			dest := strings.Replace(path, filepath.Clean(config.input), "", 1)
			dest = filepath.Join(filepath.Clean(config.output), dest)
			f.dest = dest
			f.Type = FiletypeCopy
		}

		config.files = append(config.files, &f)

		return nil
	})

	buildRelationShips(*config)
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

func buildRelationShips(config gomiConfig) []*file {
	var filesWithRelationships []*file
	for _, file := range config.files {
		ancestor, siblings, children := getPageRelationships(file.dest, config)

		file.Ancestors = ancestor
		file.Siblings = siblings
		file.Children = children

		filesWithRelationships = append(filesWithRelationships, file)
	}

	return filesWithRelationships
}

func getPageRelationships(path string, config gomiConfig) ([]*file, []*file, []*file) {
	ancestorPath := filepath.Join(path, "..", "..", "..")
	siblingsPath := filepath.Join(path, "..", "..")
	childrenPath := filepath.Join(path, "..")

	var ancestor []*file
	var siblings []*file
	var children []*file

	for _, p := range config.files {
		if filepath.Dir(p.dest) == config.output {
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

	return ancestor, siblings, children
}

func pageIsInPath(file, path string) bool {
	return strings.HasPrefix(file, path) && strings.Count(file[len(path):], "/") == 2
}
