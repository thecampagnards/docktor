package daemons

import (
	"net/http"

	"docktor/server/dao"
	"docktor/server/types"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// getAll find all daemons
func getAll(c echo.Context) error {
	s, err := dao.GetDaemons()
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when retrieving daemons")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	// TODO clean data when not admin
	return c.JSON(http.StatusOK, s)
}

// getByID find one daemon by id
func getByID(c echo.Context) error {
	s, err := dao.GetDaemonByID(c.Param(types.DAEMON_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	// TODO clean data when not admin
	return c.JSON(http.StatusOK, s)
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
	s, err := dao.CreateOrUpdateDaemon(u)
	if err != nil {
		log.WithFields(log.Fields{
			"daemon": u,
			"error":  err,
		}).Error("Error when creating/updating daemons")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// deleteByID delete one daemon by id
func deleteByID(c echo.Context) error {
	err := dao.DeleteDaemon(c.Param(types.DAEMON_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when deleting daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, "ok")
}
