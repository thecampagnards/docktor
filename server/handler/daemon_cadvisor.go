package handler

import (
	"net/http"

	"docktor/server/dao"
	"docktor/server/utils"

	"github.com/labstack/echo"
)

// GetCAdvisorStaticInfo get cadvisor info of daemon
func (st *Daemon) GetCAdvisorStaticInfo(c echo.Context) error {

	daemon, err := dao.GetDaemonByID(c.Param("daemonID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	in, err := utils.CAdvisorStaticInfo(daemon)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, in)
}
