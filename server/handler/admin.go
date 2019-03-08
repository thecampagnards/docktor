package handler

import (
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/labstack/echo"
)

// Admin struct which contains the functions of this class
type Admin struct {
}

// GetAssets this function return the assets
func (a *Admin) GetAssets(c echo.Context) error {
	files := make(map[string]string)

	dir, err := os.Getwd()
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	filepath.Walk(dir+"/assets", func(path string, info os.FileInfo, err error) error {
		if info.IsDir() {
			return nil
		}

		b, _ := ioutil.ReadFile(path)
		files[strings.TrimPrefix(path, dir+"/assets/")] = string(b)
		return nil
	})

	return c.JSON(http.StatusOK, files)
}

// SaveAsset an asset
func (a *Admin) SaveAsset(c echo.Context) error {

	dir, err := os.Getwd()
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	outFile, err := os.Create(dir + "/assets/" + c.Param("assetName"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	defer outFile.Close()

	_, err = io.Copy(outFile, c.Request().Body)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, "ok")
}
