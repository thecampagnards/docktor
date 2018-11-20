package handler

import (
	"net/http"

	"docktor/server/dao"
	"docktor/server/types"
	"docktor/server/utils"

	"github.com/labstack/echo"
)

// GetContainersByGroup get containers info by group
func (st *Group) GetContainersByGroup(c echo.Context) error {

	group, err := dao.GetGroupByID(c.Param("ID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	daemon, err := dao.GetDaemonByID(group.DaemonID.Hex())
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	cs, err := utils.GetContainers(daemon)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, cs)
}

// StartSubService
func (st *Group) StartSubService(c echo.Context) error {

	var variables interface{}
	err := c.Bind(&variables)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	group, err := dao.GetGroupByID(c.Param("groupID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	subService, err := dao.GetSubServiceByID(c.Param("subserviceID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	daemon, err := dao.GetDaemonByID(group.DaemonID.Hex())
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	service, err := subService.ConvertSubService(map[string]interface{}{
		"Group":     group,
		"Daemon":    daemon,
		"Variables": variables,
	})

	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	err = utils.ComposeUp(group, daemon, service)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	// Update group
	var serviceGroup = types.ServiceGroup{
		SubServiceID: subService.ID,
		Variables:    variables,
	}

	group.Services = append(group.Services, serviceGroup)

	_, err = dao.UpdateGroup(group)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, serviceGroup)
}

// StartSubService
func (st *Group) RunSubService(c echo.Context) error {

	group, err := dao.GetGroupByID(c.Param("groupID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	var sub types.ServiceGroup
	for _, service := range group.Services {
		if sub.SubServiceID.Hex() == c.Param("subserviceID") {
			sub = service
			break
		}
	}

	subService, err := dao.GetSubServiceByID(c.Param("subserviceID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	if sub == (types.ServiceGroup{}) {
		return c.JSON(http.StatusBadRequest, "No service found")
	}

	daemon, err := dao.GetDaemonByID(group.DaemonID.Hex())
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	service, err := subService.ConvertSubService(map[string]interface{}{
		"Group":     group,
		"Daemon":    daemon,
		"Variables": sub.Variables,
	})

	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	err = utils.ComposeUp(group, daemon, service)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, sub)
}

// GetContainers get containers info by group
func (st *Group) GetContainers(c echo.Context) error {

	group, err := dao.GetGroupByID(c.Param("ID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	daemon, err := dao.GetDaemonByID(group.DaemonID.Hex())
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	cs, err := utils.GetContainers(daemon)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, cs)
}
