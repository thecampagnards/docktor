package groups

import (
	"docktor/server/storage"
	"docktor/server/types"
	"net/http"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// getCAdvisorInfo get cadvisor info of container
func getCAdvisorInfo(c echo.Context) error {

	group := c.Get("group").(types.Group)

	db := c.Get("DB").(*storage.Docktor)
	daemon, err := db.Daemons().FindByIDBson(group.Daemon)
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	in, err := daemon.CAdvisorInfoFilterFs(group.Name)
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving cadvisor infos")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, in)
}
