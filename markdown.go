package main

import (
	"bytes"

	"github.com/yuin/goldmark"
	highlighting "github.com/yuin/goldmark-highlighting/v2"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
	"go.abhg.dev/goldmark/frontmatter"
)

func newMarkdownParser(highlightTheme string) goldmark.Markdown {
	return goldmark.New(
		goldmark.WithExtensions(
			&frontmatter.Extender{},
			highlighting.NewHighlighting(
				highlighting.WithStyle(highlightTheme),
			),
		),
		goldmark.WithRendererOptions(
			html.WithUnsafe(),
		),
	)
}

func parsePostMarkdown(md goldmark.Markdown, content []byte) ([]byte, postMeta) {
	var buf bytes.Buffer
	var postMeta postMeta

	ctx := parser.NewContext()
	md.Convert(content, &buf, parser.WithContext(ctx))

	fm := frontmatter.Get(ctx)
	if fm != nil {
		err := fm.Decode(&postMeta)
		check(err)
	}

	return buf.Bytes(), postMeta
}
