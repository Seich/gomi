package main

import (
	"errors"
	"io/fs"
	"net/url"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"time"

	"github.com/anthonynsimon/bild/imgio"
	"github.com/anthonynsimon/bild/transform"
	"github.com/charmbracelet/log"
	"github.com/tidwall/gjson"
	"github.com/tidwall/sjson"
)

type photoDb struct {
	config        gomiConfig
	dbFilePath    string
	dbFileContent string
}

func openPhotoDB(config gomiConfig) *photoDb {
	photos := new(photoDb)
	photos.config = config
	photos.dbFilePath = filepath.Join(config.photosDir, "db.json")

	content, err := os.ReadFile(photos.dbFilePath)

	if errors.Is(err, os.ErrNotExist) {
		os.Create(photos.dbFilePath)
		os.WriteFile(photos.dbFilePath, []byte("{}"), os.ModePerm)
		content = []byte("{}")
	} else {
		check(err)
	}

	photos.dbFileContent = string(content)

	return photos
}

func (db *photoDb) getPhoto(photo *file) *file {
	_, filename := filepath.Split(photo.src)
	photoKey := strings.Replace(filename, ".", "\\.", 10)
	data := gjson.Get(db.dbFileContent, photoKey)
	dest := strings.Replace(photo.src, db.config.input, db.config.output, 1)
	dest = strings.Replace(dest, "_photos", "photos", 1)
	url, err := url.JoinPath("/photos", filename)
	check(err)

	photo.dest = dest
	photo.Url = url
	photo.Title = filename
	photo.Date = time.Now()

	if !data.Exists() {
		content, err := sjson.Set(db.dbFileContent, photoKey, map[string]string{
			"title": photo.Title,
			"date":  photo.Date.Format("2006-01-02"),
		})

		check(err)

		db.dbFileContent = content

		log.Info("Importing", "Photo", filename)
	} else {
		date, err := time.Parse("2006-01-02", data.Get("date").String())
		check(err)
		title := data.Get("title").String()

		photo.Date = date
		photo.Title = title
	}

	return photo
}

func (db *photoDb) save() {
	err := os.WriteFile(filepath.Join(db.config.photosDir, "db.json"), []byte(db.dbFileContent), os.ModePerm)
	check(err)
}

func loadPhoto(f *file) {
	db := openPhotoDB(*f.config)
	photoFile := db.getPhoto(f)
	dir, filename := filepath.Split(photoFile.dest)
	thumbnailPath := filepath.Join(dir, "/thumbs/", filename)
	photoFile.ThumbnailUrl = thumbnailPath[len(f.config.output):]

	if _, err := os.Stat(thumbnailPath); errors.Is(err, os.ErrNotExist) {
		img, err := imgio.Open(f.src)
		check(err)

		height := 300
		width := img.Bounds().Dx() / (img.Bounds().Dy() / height)

		thumbnail := transform.Resize(img, width, height, transform.Linear)

		ensureDirectoryExists(thumbnailPath)
		err = imgio.Save(thumbnailPath, thumbnail, imgio.JPEGEncoder(100))
		check(err)

		log.Info("Thumbnail created", "File", filename, "Thumbnail", thumbnailPath)
	}

	db.save()
}

func addPhotos(config *gomiConfig) {
	if !directoryExists(config.photosDir) {
		return
	}

	filepath.WalkDir(config.photosDir, func(path string, d fs.DirEntry, err error) error {
		if d.IsDir() || !isPhoto(path, config) {
			return nil
		}

		config.files = append(config.files, &file{src: path, Type: FiletypePhoto, config: config})

		return nil
	})

}

func isPhoto(path string, config *gomiConfig) bool {
	return isPathInside(path, config.photosDir) && isSupportedImage(path)
}

func isSupportedImage(path string) bool {
	extensions := []string{".jpg", ".jpeg", ".png", ".bmp", ".webp"}
	ext := filepath.Ext(path)
	isImage := slices.Contains(extensions, ext)

	return isImage
}
