package main

import (
	"io/fs"
	"os"
	"path/filepath"
	"slices"
	"strings"
)

func loadPages(config gomiConfig) ([]file, []file) {
	var filesToCopy []file
	var filesToPreprocess []file
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
		if strings.HasPrefix(d.Name(), ".") {
			return nil
		}

		if strings.HasPrefix(d.Name(), "_") {
			return nil
		}

		dest := strings.Replace(path, config.input, config.output, 1)
		page := file{src: path, dest: dest}

		if shouldBeCopied(path) {
			filesToCopy = append(filesToCopy, file{src: path, dest: dest})
			return nil
		}

		fileContent, err := os.ReadFile(path)
		check(err)

		page.Content = fileContent

		if isMarkdownFile(path) {
			buf, meta := parsePostMarkdown(config.markdownParser, fileContent)
			page.Title = meta.Title
			page.Tags = meta.Tags
			page.dest = strings.Replace(page.dest, ".md", ".html", 1)

			layout := findLayoutFor(config, path)
			if layout != nil {
				buf = []byte(strings.Replace(string(layout), "{{ content }}", string(buf), 1))
			}

			page.Content = buf
		}

		check(err)

		page.Url = page.dest[len(config.output):]
		page.Content = []byte(strings.Replace(string(page.Content), "{{ content }}", string(page.Content), 1))

		filesToPreprocess = append(filesToPreprocess, page)

		return nil
	})

	filesToPreprocess = buildRelationShips(filesToPreprocess, config)

	return filesToCopy, filesToPreprocess
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

func buildRelationShips(filesToPreprocess []file, config gomiConfig) []file {
	var filesWithRelationships []file
	for _, file := range filesToPreprocess {
		ancestor, siblings, children := getPageRelationships(filesToPreprocess, file.dest, config)

		file.Ancestors = ancestor
		file.Siblings = siblings
		file.Children = children

		filesWithRelationships = append(filesWithRelationships, file)
	}

	return filesWithRelationships
}

func getPageRelationships(files []file, path string, config gomiConfig) ([]file, []file, []file) {
	ancestorPath := filepath.Join(path, "..", "..", "..")
	siblingsPath := filepath.Join(path, "..", "..")
	childrenPath := filepath.Join(path, "..")

	var ancestor []file
	var siblings []file
	var children []file

	for _, p := range files {
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
