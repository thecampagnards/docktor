package groups

import (
	"fmt"
	"net/http"
	"strconv"

	"docktor/server/storage"
	"docktor/server/types"

	"github.com/labstack/echo/v4"
	log "github.com/sirupsen/logrus"
)

// createServiceGroup this function create and run a sub service via compose
func createServiceGroup(c echo.Context) error {

	group := c.Get("group").(types.Group)

	var variables []types.ServiceVariable
	err := c.Bind(&variables)
	if err != nil {
		log.WithFields(log.Fields{
			"variables": c.Request().Body,
			"error":     err,
		}).Error("Error when parsing variables")
		return c.JSON(http.StatusBadRequest, err)
	}

	db := c.Get("DB").(*storage.Docktor)
	subService, err := db.Services().FindSubServicByID(c.Param(types.SUBSERVICE_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"subserviceID": c.Param(types.SUBSERVICE_ID_PARAM),
			"error":        err,
		}).Error("Error when retrieving subservice")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	// Assign form variables for the convert
	subService.Variables = variables

	daemon, err := db.Daemons().FindByIDBson(group.Daemon)
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID":  group.Daemon,
			"groupName": group.Name,
			"error":     err,
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	serviceName := c.QueryParam("service-name")
	autoUpdate, _ := strconv.ParseBool(c.QueryParam("auto-update"))

	err = types.ValidateServiceName(serviceName, group, daemon)
	if err != nil {
		return c.JSON(http.StatusConflict, err.Error())
	}

	serviceGroup, err := subService.ConvertToGroupService(serviceName, daemon, group, autoUpdate)
	if err != nil {
		log.WithFields(log.Fields{
			"serviceGroup": serviceGroup,
			"error":        err,
		}).Error("Error when getting compose file of subservice")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	err = daemon.ComposeUp(group.Name, serviceName, group.Subnet, [][]byte{serviceGroup.File})
	if err != nil {
		log.WithFields(log.Fields{
			"serviceGroup": serviceGroup,
			"error":        err,
		}).Error("Error when starting subservice")
		return err
	}

	group.Services = append(group.Services, serviceGroup)

	group, err = db.Groups().Save(group)
	if err != nil {
		log.WithFields(log.Fields{
			"groupName": group.Name,
			"error":     err,
		}).Error("Error when updating group")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, serviceGroup)
}

// updateServiceGroupStatus change the status of composed file
func updateServiceGroupStatus(c echo.Context) error {

	group := c.Get("group").(types.Group)
	db := c.Get("DB").(*storage.Docktor)

	serviceGroup := group.FindServiceByID(c.Param(types.SUBSERVICE_ID_PARAM))
	if serviceGroup == nil {
		log.WithFields(log.Fields{
			"groupName":    group.Name,
			"subserviceID": types.SUBSERVICE_ID_PARAM,
		}).Error("Error when retrieving group")
		return c.JSON(http.StatusBadRequest, "The subservice doesn't exist in this group")
	}

	daemon, err := db.Daemons().FindByIDBson(group.Daemon)
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID":  group.Daemon,
			"groupName": group.Name,
			"error":     err,
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	contextName := fmt.Sprintf("%s_%s", group.Name, serviceGroup.Name)

	switch c.QueryParam("status") {
	case "start":
		err = daemon.ComposeUp(group.Name, serviceGroup.Name, group.Subnet, [][]byte{serviceGroup.File})
	case "stop":
		err = daemon.ComposeStop(contextName, [][]byte{serviceGroup.File})
	case "remove":
		err = daemon.ComposeRemove(contextName, [][]byte{serviceGroup.File})
	case "destroy":
		for key, service := range group.Services {
			if service.SubServiceID == serviceGroup.SubServiceID {
				group.Services = append(group.Services[:key], group.Services[key+1:]...)
			}
		}
		_, err = db.Groups().Save(group)
	default:
		log.WithFields(log.Fields{
			"daemon": daemon.Name,
			"status": c.QueryParam("status"),
			"error":  "Wrong status",
		}).Error("Wrong status")
		return c.JSON(http.StatusBadRequest, "Wrong status")
	}

	if err != nil {
		log.WithFields(log.Fields{
			"contextName": contextName,
			"daemonHost":  daemon.Host,
			"service":     serviceGroup.File,
			"error":       err,
		}).Error("Error when compose up")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, serviceGroup)
}

// getServiceGroupStatus get the status of group service
func getServiceGroupStatus(c echo.Context) error {

	group := c.Get("group").(types.Group)
	db := c.Get("DB").(*storage.Docktor)

	serviceGroup := group.FindServiceByID(c.Param(types.SUBSERVICE_ID_PARAM))
	if serviceGroup == nil {
		log.WithFields(log.Fields{
			"groupName":    group.Name,
			"subserviceID": types.SUBSERVICE_ID_PARAM,
		}).Error("Error when retrieving group service")
		return c.JSON(http.StatusBadRequest, "The subservice doesn't exist in this group")
	}

	daemon, err := db.Daemons().FindByIDBson(group.Daemon)
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID":  group.Daemon,
			"groupName": group.Name,
			"error":     err,
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	info, err := daemon.ComposeStatus(fmt.Sprintf("%s_%s", group.Name, serviceGroup.Name), [][]byte{serviceGroup.File})
	if err != nil {
		log.WithFields(log.Fields{
			"groupName":  group.Name,
			"daemonHost": daemon.Host,
			"service":    serviceGroup.File,
			"error":      err,
		}).Error("Error when compose info")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, info)
}
