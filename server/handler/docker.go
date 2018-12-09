package handler

import (
	"docktor/server/dao"
	"docktor/server/utils"

	"net/http"

	"github.com/labstack/echo"
)

// Docker struct which contains the functions of this class
type Docker struct {
}

// GetGroupContainers get containers of a group
func (d *Docker) GetGroupContainers(c echo.Context) error {

	group, err := dao.GetGroupByID(c.Param("daemonID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	daemon, err := dao.GetDaemonByID(group.DaemonID.Hex())
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	var containers []string

	for _, s := range group.Services {
		containers = append(containers, s.Containers...)
	}

	cs, err := utils.InspectContainers(daemon, containers...)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, cs)
}
