package groups

import (
	"docktor/server/storage"
	"docktor/server/types"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	log "github.com/sirupsen/logrus"
)

// createServiceGroup this function create and run a sub service via compose
func createServiceGroup(c echo.Context) error {

	var variables []types.ServiceVariable
	err := c.Bind(&variables)
	if err != nil {
		log.WithFields(log.Fields{
			"variables": c.Request().Body,
			"error":     err,
		}).Error("Error when parsing variables")
		return c.JSON(http.StatusBadRequest, err)
	}

	group := c.Get("group").(types.Group)

	db := c.Get("DB").(*storage.Docktor)
	subService, err := db.Services().FindSubServicByID(c.Param(types.SUBSERVICE_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"subserviceID": c.Param(types.SUBSERVICE_ID_PARAM),
			"error":        err,
		}).Error("Error when retrieving subservice")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	var serviceGroup = types.GroupService{
		SubServiceID: subService.ID,
	}

	serviceGroup.Name = c.QueryParam("service-name")
	serviceGroup.AutoUpdate, _ = strconv.ParseBool(c.QueryParam("auto-update"))

	daemon, err := db.Daemons().FindByIDBson(group.Daemon)
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID":  group.Daemon,
			"groupName": group.Name,
			"error":     err,
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	file, err := group.GetComposeService(daemon, subService, variables)
	if err != nil {
		log.WithFields(log.Fields{
			"serviceGroup": serviceGroup,
			"error":        err,
		}).Error("Error when getting compose file of subservice")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	err = daemon.ComposeUp(group.Name, group.Subnet, [][]byte{file})
	if err != nil {
		log.WithFields(log.Fields{
			"serviceGroup": serviceGroup,
			"error":        err,
		}).Error("Error when starting subservice")
		return err
	}

	serviceGroup.Variables = variables
	serviceGroup.File = string(file)
	serviceGroup.URL = daemon.Host

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

	switch c.QueryParam("status") {
	case "start":
		err = daemon.ComposeUp(group.Name, group.Subnet, [][]byte{[]byte(serviceGroup.File)})
	case "stop":
		err = daemon.ComposeStop(group.Name, [][]byte{[]byte(serviceGroup.File)})
	case "remove":
		err = daemon.ComposeRemove(group.Name, [][]byte{[]byte(serviceGroup.File)})
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
			"groupName":  group.Name,
			"daemonHost": daemon.Host,
			"service":    serviceGroup.File,
			"error":      err,
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

	info, err := daemon.ComposeStatus(group.Name, [][]byte{[]byte(serviceGroup.File)})
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
