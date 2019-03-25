package groups

import (
	"docktor/server/dao"
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

	daemon, err := dao.GetDaemonByID(group.DaemonID.Hex())
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

	log.WithField("fs", in.Stats[0].Filesystem).Info("Retrieve container info fs")

	// keeping only the project fs
	for i := len(in.Stats[0].Filesystem) - 1; i >= 0; i-- {
		if !strings.HasSuffix(in.Stats[0].Filesystem[i].Device, group.Name) {
			in.Stats[0].Filesystem = append(in.Stats[0].Filesystem[:i], in.Stats[0].Filesystem[i+1:]...)
		}
	}

	return c.JSON(http.StatusOK, in)
}
