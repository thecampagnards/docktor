package groups

import (
	"net/http"

	"docktor/server/dao"
	"docktor/server/types"
	"docktor/server/utils"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// getContainers get containers info starting by group name
func getContainers(c echo.Context) error {

	group, err := dao.GetGroupByID(c.Param(types.GROUP_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"groupID": c.Param(types.GROUP_ID_PARAM),
			"error":   err,
		}).Error("Error when retrieving group")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	daemon, err := dao.GetDaemonByID(group.DaemonID.Hex())
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": group.DaemonID,
			"error":    err,
		}).Error("Error when retrieving group daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	cs, err := utils.GetContainersStartByName(daemon, group.Name)
	if err != nil {
		log.WithFields(log.Fields{
			"daemon": daemon,
			"error":  err,
		}).Error("Error when retrieving group daemon containers")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, cs)
}
