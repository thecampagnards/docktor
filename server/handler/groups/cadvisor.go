package groups

import (
	"docktor/server/handler/daemons"
	"docktor/server/storage"
	"docktor/server/types"
	"docktor/server/utils"
	"net/http"
	"strings"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// getCAdvisorContainerInfo get cadvisor info of container
func getCAdvisorContainerInfo(c echo.Context) error {

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

	in, err := utils.CAdvisorContainerInfo(daemon)
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving cadvisor container info")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	log.Info("Retrieve container info fs")

	// keeping only the project fs
	for i := len(in.Stats[0].Filesystem) - 1; i >= 0; i-- {
		if !strings.HasSuffix(in.Stats[0].Filesystem[i].Device, group.Name) {
			log.WithField("fs", in.Stats[0].Filesystem[i].Device).Info("Removing info fs")
			in.Stats[0].Filesystem = append(in.Stats[0].Filesystem[:i], in.Stats[0].Filesystem[i+1:]...)
		}
	}

	return c.JSON(http.StatusOK, in)
}

func getCAdvisorMachineInfo(c echo.Context) error {
	group := c.Get("group").(types.Group)
	c.SetParamNames(types.DAEMON_ID_PARAM)
	c.SetParamValues(group.Daemon.Hex())
	return daemons.GetCAdvisorMachineInfo(c)
}
