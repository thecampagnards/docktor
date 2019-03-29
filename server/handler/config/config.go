package config

import (
	"docktor/server/dao"
	"docktor/server/types"
	"net/http"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// getMessage get the message banner
func getMessage(c echo.Context) error {
	m, err := dao.GetMessage()
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when retrieving message")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, m)
}

// save a Group server
func saveMessage(c echo.Context) error {
	var m types.Message
	err := c.Bind(&m)
	if err != nil {
		log.WithFields(log.Fields{
			"body":  c.Request().Body,
			"error": err,
		}).Error("Error when parsing message")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	m, err = dao.CreateOrUpdateMessage(m)
	if err != nil {
		log.WithFields(log.Fields{
			"message": m,
			"error":   err,
		}).Error("Error when updating/creating message")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, m)
}
