package commands

import (
	"net/http"

	"docktor/server/storage"
	"docktor/server/types"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// getAll find all commands
func getAll(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)

	commands, err := db.Commands().FindAll()
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when retrieving commands")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, commands)
}

// getByImage find one command by image
func getByImage(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)
	command, err := db.Commands().FindByImage(c.Param(types.COMMAND_IMAGE_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"commandImage": c.Param(types.COMMAND_IMAGE_PARAM),
			"error":        err,
		}).Error("Error when retrieving command")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, command)
}

// save create/update a command
func save(c echo.Context) error {
	var u types.Commands
	err := c.Bind(&u)
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when saving commands")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	db := c.Get("DB").(*storage.Docktor)
	for key, command := range u {
		u[key], err = db.Commands().Save(command)
		if err != nil {
			log.WithFields(log.Fields{
				"command": command,
				"error":   err,
			}).Error("Error when creating/updating commands")
		}
	}

	return c.JSON(http.StatusOK, u)
}

// deleteByImage delete one command by id
func deleteByImage(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)
	err := db.Commands().Delete(c.Param(types.COMMAND_IMAGE_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"commandImage": c.Param(types.COMMAND_IMAGE_PARAM),
			"error":        err,
		}).Error("Error when deleting command")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, "ok")
}
