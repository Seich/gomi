package main

import (
	"context"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/alexflint/go-arg"
	"github.com/charmbracelet/log"
	"github.com/jaschaephraim/lrserver"
	_ "github.com/joho/godotenv/autoload"
	"github.com/sgtdi/fswatcher"
)

type WatchCmd struct {
}

type args struct {
	WorkDir         string    `arg:"-w"`
	Input           string    `arg:"-i,env:GOMI_INPUT"`
	Output          string    `arg:"-o,env:GOMI_OUTPUT"`
	HighlightTheme  string    `arg:"env:GOMI_HIGHLIGHT_THEME"`
	SiteUrl         string    `arg:"env:SITE_URL"`
	SiteDescription string    `arg:"env:SITE_DESCRIPTION"`
	SiteName        string    `arg:"env:SITE_NAME"`
	Watch           *WatchCmd `arg:"subcommand:watch"`
}

func (args) Version() string {
	return "0.0.1"
}

func (args) Description() string {
	return "Hello World"
}

func main() {
	var args args
	arg.MustParse(&args)

	if len(args.WorkDir) > 0 {
		log.Info("WD Changed", "WD", args.WorkDir)
		os.Chdir(args.WorkDir)
	}

	gomi := NewGomiConfig(args)

	if args.Watch != nil {
		gomi.hot = true
		gomi.writeAll()

		go http.ListenAndServe(":8000", http.FileServer(http.Dir(gomi.output)))
		lr := lrserver.New(lrserver.DefaultName, lrserver.DefaultPort)
		lr.SetErrorLog(log.Default().StandardLog())
		lr.SetStatusLog(log.Default().StandardLog())
		go lr.ListenAndServe()

		w, err := fswatcher.New(
			fswatcher.WithCooldown(200*time.Millisecond),
			fswatcher.WithPath(gomi.input),
			fswatcher.WithExcRegex(`db\.json$`),
		)

		check(err)

		ctx := context.Background()
		go w.Watch(ctx)

		cwd, err := os.Getwd()
		check(err)

		for event := range w.Events() {
			path := event.Path[len(cwd)+1:]
			file := gomi.fileMap[path]

			if path == filepath.Join(gomi.input, "_layout.html") {
				gomi = NewGomiConfig(args)
				gomi.hot = true
				gomi.writeAll()
				lr.Reload("")
			} else if file != nil {
				if strings.Contains(path, "_layout.html") {
					layout := gomi.getLayout(path)
					layout.load()
					for _, file := range gomi.files {
						if file.layout == layout {
							file.load()
							file.write()
						}
					}
					lr.Reload("")
				} else {
					file.load()
					file.write()
					lr.Reload(path)
				}
			}
		}
	}
}
