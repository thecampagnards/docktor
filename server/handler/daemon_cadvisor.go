package handler

import (
	"net/http"

	"docktor/server/dao"
	"docktor/server/utils"

	"github.com/labstack/echo"
)

// GetCAdvisorContainerInfo get cadvisor info of container
func (st *Daemon) GetCAdvisorContainerInfo(c echo.Context) error {

	daemon, err := dao.GetDaemonByID(c.Param("daemonID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	in, err := utils.CAdvisorContainerInfo(daemon)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, in)
}

// GetCAdvisorMachineInfo get cadvisor info of machine
func (st *Daemon) GetCAdvisorMachineInfo(c echo.Context) error {

	daemon, err := dao.GetDaemonByID(c.Param("daemonID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	in, err := utils.CAdvisorMachineInfo(daemon)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, in)
}
