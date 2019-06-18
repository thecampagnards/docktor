package daemons

import (
	"net/http"

	"docktor/server/storage"
	"docktor/server/types"

	"github.com/labstack/echo/v4"
	log "github.com/sirupsen/logrus"
)

// getAll find all daemons
func getAll(c echo.Context) error {
	user := c.Get("user").(types.User)
	db := c.Get("DB").(*storage.Docktor)

	if user.IsAdmin() {
		daemons, err := db.Daemons().FindAll()
		if err != nil {
			log.WithFields(log.Fields{
				"error": err,
			}).Error("Error when retrieving daemons")
			return c.JSON(http.StatusBadRequest, err.Error())
		}
		return c.JSON(http.StatusOK, daemons)

	}
	daemons, err := db.Daemons().FindAllLight()
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when retrieving daemons")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, daemons)
}

// getByID find one daemon by id
func getByID(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)
	daemon, err := db.Daemons().FindByID(c.Param(types.DAEMON_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	// TODO clean data when not admin
	return c.JSON(http.StatusOK, daemon)
}

// save create/update a daemon
func save(c echo.Context) error {
	var u types.Daemon
	err := c.Bind(&u)
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when saving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	db := c.Get("DB").(*storage.Docktor)
	u, err = db.Daemons().Save(u)
	if err != nil {
		log.WithFields(log.Fields{
			"daemon": u,
			"error":  err,
		}).Error("Error when creating/updating daemons")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	// Update the docker status
	u.SetDockerStatus()
	u, err = db.Daemons().Save(u)
	if err != nil {
		log.WithFields(log.Fields{
			"daemon": u,
			"error":  err,
		}).Error("Error when creating/updating daemons")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, u)
}

// deleteByID delete one daemon by id
func deleteByID(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)
	err := db.Daemons().Delete(c.Param(types.DAEMON_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when deleting daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, "ok")
}
