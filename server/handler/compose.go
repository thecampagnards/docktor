package handler

import (
	"docktor/server/dao"
	"docktor/server/types"
	"docktor/server/utils"
	"net/http"

	"github.com/labstack/echo"
)

// Compose struct which contains the functions of this class
type Compose struct {
}

// StartSubService this function create and run a service via compose
func (co *Compose) StartSubService(c echo.Context) error {

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

	_, err = dao.CreateOrUpdateGroup(group)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, serviceGroup)
}
