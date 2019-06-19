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

	var variables map[string]interface{}
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

	var serviceGroup = types.ServiceGroup{
		SubServiceID: subService.ID,
		Variables:    variables,
	}

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

	file, err := group.GetComposeService(daemon, subService, serviceGroup)
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

// getServiceGroupFile this function run a group service via compose
func getServiceGroupFile(c echo.Context) error {

	group := c.Get("group").(types.Group)
	db := c.Get("DB").(*storage.Docktor)

	serviceGroup := group.FindSubServiceByID(c.Param(types.SUBSERVICE_ID_PARAM))
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

	subService, err := db.Services().FindSubServicByIDBson(serviceGroup.SubServiceID)
	if err != nil {
		log.WithFields(log.Fields{
			"subserviceID": serviceGroup.SubServiceID,
			"groupName":    group.Name,
			"daemonID":     group.Daemon,
			"error":        err,
		}).Error("Error when retrieving sub service")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	file, err := group.GetComposeService(daemon, subService, *serviceGroup)
	if err != nil {
		log.WithFields(log.Fields{
			"serviceGroup": serviceGroup,
			"error":        err,
		}).Error("Error when getting compose file of subservice")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	c.Response().Header().Set(echo.HeaderContentType, types.MIME_YAML)
	c.Response().WriteHeader(http.StatusOK)
	c.Response().Write(file)
	return nil
}

// startServiceGroup this function run a subservice via compose
func startServiceGroup(c echo.Context) error {

	group := c.Get("group").(types.Group)
	db := c.Get("DB").(*storage.Docktor)

	serviceGroup := group.FindSubServiceByID(c.Param(types.SUBSERVICE_ID_PARAM))
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

	subService, err := db.Services().FindSubServicByIDBson(serviceGroup.SubServiceID)
	if err != nil {
		log.WithFields(log.Fields{
			"subserviceID": serviceGroup.SubServiceID,
			"groupName":    group.Name,
			"daemonID":     group.Daemon,
			"error":        err,
		}).Error("Error when retrieving sub service")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	file, err := group.GetComposeService(daemon, subService, *serviceGroup)
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
			"groupName":  group.Name,
			"daemonHost": daemon.Host,
			"service":    string(file),
			"error":      err,
		}).Error("Error when compose up")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, serviceGroup)
}
