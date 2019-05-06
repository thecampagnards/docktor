package daemons

import (
	"net/http"

	"docktor/server/storage"
	"docktor/server/types"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// getCAdvisorContainerInfo get cadvisor info of container
func getCAdvisorContainerInfo(c echo.Context) error {

	db := c.Get("DB").(*storage.Docktor)
	daemon, err := db.Daemons().FindByID(c.Param(types.DAEMON_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	in, err := daemon.CAdvisorContainerInfo()
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving cadvisor container info")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, in)
}

// getCAdvisorMachineInfo get cadvisor info of machine
func getCAdvisorMachineInfo(c echo.Context) error {

	db := c.Get("DB").(*storage.Docktor)
	daemon, err := db.Daemons().FindByID(c.Param(types.DAEMON_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	in, err := daemon.CAdvisorMachineInfo()
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving cadvisor machine info")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, in)
}
