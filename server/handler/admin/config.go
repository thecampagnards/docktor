package admin

import (
	"docktor/server/dao"
	"docktor/server/types"
	"net/http"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// getMessage get the message banner
func getMessage(c echo.Context) error {
	m, err := dao.GetConfig()
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when retrieving message")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, m.Message)
}

// getConfig get the config
func getConfig(c echo.Context) error {
	m, err := dao.GetConfig()
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

	m, err = dao.CreateOrUpdateConfig(m)
	if err != nil {
		log.WithFields(log.Fields{
			"config": m,
			"error":  err,
		}).Error("Error when updating/creating config")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, m)
}
