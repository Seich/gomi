package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/alexflint/go-arg"
	"github.com/charmbracelet/log"
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
	gomi.Load()
	gomi.WriteAll()
	gomi.GenerateBlogFeed()

	w, _ := fswatcher.New(fswatcher.WithCooldown(200*time.Millisecond), fswatcher.WithPath(gomi.input))
	ctx := context.Background()
	go w.Watch(ctx)

	if args.Watch != nil {
		for event := range w.Events() {
			var types, flags []string
			// Loop through types and flags
			for _, t := range event.Types {
				types = append(types, t.String())
			}
			for _, f := range event.Flags {
				flags = append(flags, f)
			}
			fmt.Printf("File changed: %s %v %v\n", event.Path, types, flags)
		}
	} else {
		// buildEverything(config)
	}

}
