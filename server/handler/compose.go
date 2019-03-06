package handler

import (
	"docktor/server/dao"
	"docktor/server/types"
	"docktor/server/utils"
	"net/http"
	"os"
	"reflect"
	"strconv"
	"strings"

	"github.com/docker/libcompose/config"
	yaml "gopkg.in/yaml.v2"

	"github.com/labstack/echo"
)

// Compose struct which contains the functions of this class
type Compose struct {
}

// StartSubService this function create and run a service via compose
func (co *Compose) StartSubService(c echo.Context) error {

	var variables map[string]interface{}
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

	templateVariables := variables
	templateVariables["Group"] = group
	templateVariables["Daemon"] = daemon

	service, err := subService.ConvertSubService(templateVariables)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	var config config.Config
	if err := yaml.Unmarshal(service, &config); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	autoUpdate, _ := strconv.ParseBool(c.QueryParam("auto-update"))
	if autoUpdate {
		// Use https://github.com/v2tec/watchtower
		c.Logger().Infof("Auto update for %s with watchtower", subService.Name)
		for key := range config.Services {
			if labels, ok := config.Services[key]["labels"]; ok {
				v := reflect.ValueOf(labels)
				config.Services[key]["labels"] = reflect.Append(v, reflect.ValueOf(types.WATCHTOWER_LABEL)).Interface()
			} else {
				config.Services[key]["labels"] = []string{types.WATCHTOWER_LABEL}
			}
		}
		c.Logger().Infof("Configuration updated: %v", config)
	}

	port, _ := strconv.ParseBool(c.QueryParam("fix-port"))
	if port {
		c.Logger().Infof("Fix port for %s", subService.Name)
		// TODO
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

// StartDaemonService this function create and run a daemon service (cadvisor, watchtower) via compose
// this service is in asset folder
func (co *Compose) StartDaemonService(c echo.Context) error {
	daemon, err := dao.GetDaemonByID(c.Param("daemonID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	dir, err := os.Getwd()
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	splitFn := func(c rune) bool {
		return c == ','
	}

	services := strings.FieldsFunc(c.QueryParam("services"), splitFn)
	for i := 0; i < len(services); i++ {
		services[i] = dir + "/assets/" + services[i] + "-compose.yml"
	}

	switch c.QueryParam("status") {
	case "start":
		err = utils.ComposeUpDaemon(daemon, services...)
	case "stop":
		err = utils.ComposeStopDaemon(daemon, services...)
	case "remove":
		err = utils.ComposeRemoveDaemon(daemon, services...)
	default:
		return c.JSON(http.StatusBadRequest, "Wrong status")
	}

	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, "ok")
}
