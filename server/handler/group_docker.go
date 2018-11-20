package handler

import (
	"bytes"
	"net/http"
	"text/template"

	"web-docker-manager/server/types"

	"web-docker-manager/server/dao"
	"web-docker-manager/server/utils"

	"github.com/labstack/echo"
)

// GetContainersByGroup get containers info by group
func (st *Group) GetContainersByGroup(c echo.Context) error {

	group, err := dao.GetGroupByID(c.Param("ID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	daemon, err := dao.GetDaemonByID(group.DaemonID.String())
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	cs, err := utils.GetContainers(daemon)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, cs)
}

// Compose files
func (st *Group) Compose(c echo.Context) error {

	group, err := dao.GetGroupByID(c.Param("ID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	service, err := dao.GetServiceBySubSeriveID(ss.ID.String())
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	daemon, err := dao.GetDaemonByID(group.DaemonID.String())
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, "running")
}

func run(daemon types.Daemon, group types.Group, sub types.SubService) error {

	tmpl, err := template.New("template").Parse(sub.File)
	if err != nil {
		return err
	}
	var b bytes.Buffer

	err = tmpl.Execute(&b, map[string]interface{}{
		"Group":     group,
		"Daemon":    daemon,
		"Variables": "var",
	})
	if err != nil {
		return err
	}

	err = utils.ComposeUp(group, daemon, b.Bytes())
	if err != nil {
		return err
	}
	return nil
}

// GetContainers get containers info by group
func (st *Group) GetContainers(c echo.Context) error {

	group, err := dao.GetGroupByID(c.Param("ID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	daemon, err := dao.GetDaemonByID(group.DaemonID.String())
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	cs, err := utils.GetContainers(daemon)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, cs)
}
