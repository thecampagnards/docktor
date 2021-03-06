package admin

import (
	"docktor/server/storage"
	"docktor/server/types"
	"net/http"

	"github.com/labstack/echo/v4"
	log "github.com/sirupsen/logrus"
)

// getConfig get the config
func getConfig(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)
	m, err := db.Config().Find()
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when retrieving config")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, m)
}

// saveConfig
func saveConfig(c echo.Context) error {
	var m types.Config
	err := c.Bind(&m)
	if err != nil {
		log.WithFields(log.Fields{
			"body":  c.Request().Body,
			"error": err,
		}).Error("Error when parsing config")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	db := c.Get("DB").(*storage.Docktor)
	m, err = db.Config().Save(m)
	if err != nil {
		log.WithFields(log.Fields{
			"config": m,
			"error":  err,
		}).Error("Error when updating/creating config")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, m)
}
