package handler

import (
	"web-docker-manager/server/dao"
	"web-docker-manager/server/utils"

	"net/http"

	"github.com/labstack/echo"
)

// Docker struct which contains the functions of this class
type Docker struct {
}

// GetContainersByDaemon get containers info by daemon
func (d *Docker) GetContainersByDaemon(c echo.Context) error {

	daemon, err := dao.GetDaemonByID(c.Param("ID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	cs, err := utils.GetContainers(daemon)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, cs)
}
