package main

import (
	"fmt"
	"path/filepath"
	"regexp"

	"github.com/osteele/liquid"
	"github.com/osteele/liquid/render"
)

func newLiquidEngine() *liquid.Engine {
	engine := liquid.NewEngine()
	engine.EnableJekyllExtensions()

	engine.RegisterTag("image", func(ctx render.Context) (string, error) {
		post := ctx.Bindings()["post"].(file)
		file, alt := parseImageArgs(ctx.TagArgs())
		path := filepath.Join("/", post.FilesDir, file)

		return fmt.Sprintf("<img src=\"%s\" alt=\"%s\" />", path, alt), nil
	})

	engine.RegisterTag("video", func(ctx render.Context) (string, error) {
		post := ctx.Bindings()["post"].(file)
		file := ctx.TagArgs()
		file = filepath.Join("/", post.FilesDir, file)

		return fmt.Sprintf(`
		<video playsinline="" muted="muted" autoplay="autoplay" preload="auto" loop="loop">
		<source src="%s" type="video/mp4" />
		</video>
		`, file), nil
	})

	return engine
}

func parseImageArgs(args string) (string, string) {
	// filename.jpg 'image description'
	r := regexp.MustCompile(`^(.+?)\s+['"](.+?)['"]$`)
	matches := r.FindStringSubmatch(args)

	if len(matches) > 0 {
		filename := matches[1]
		description := matches[2]
		return filename, description
	}

	return "", ""
}
