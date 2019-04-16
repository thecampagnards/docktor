package admin

import (
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"docktor/server/types"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// getAssets this function return the files in assets folder
func getAssets(c echo.Context) error {
	files := make(map[string]string)

	dir, err := os.Getwd()
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when retrieving workdir")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	assetDir := fmt.Sprintf("%s/assets/", dir)
	filepath.Walk(assetDir, func(path string, info os.FileInfo, err error) error {

		if err != nil {
			log.WithFields(log.Fields{
				"error": err,
			}).Errorf("Error when getting %s", path)
		}

		if info.IsDir() {
			return nil
		}

		log.WithFields(log.Fields{
			"path": path,
			"info": info,
		}).Info("Found file")

		b, _ := ioutil.ReadFile(path)
		files[strings.TrimPrefix(path, assetDir)] = string(b)
		return nil
	})

	log.WithFields(log.Fields{
		"files": files,
	}).Info("Files found")

	return c.JSON(http.StatusOK, files)
}

// saveAsset create or save file in assets folder
func saveAsset(c echo.Context) error {

	dir, err := os.Getwd()
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when retrieving workdir")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	filename := fmt.Sprintf("%s/assets/%s", dir, c.Param(types.ASSET_NAME_PARAM))
	outFile, err := os.Create(filename)
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Errorf("Error when getting %s", filename)
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	defer outFile.Close()

	_, err = io.Copy(outFile, c.Request().Body)
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Errorf("Error when saving %s", filename)
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, filename)
}
