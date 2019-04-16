package groups

import (
	"docktor/server/storage"
	"docktor/server/types"
	"docktor/server/utils"
	"net/http"
	"reflect"
	"strconv"

	"github.com/docker/libcompose/config"
	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
	yaml "gopkg.in/yaml.v2"
)

// createSubService this function create and run a sub service via compose
func createSubService(c echo.Context) error {

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
	subService, err := db.Services().FindSubServicByID(c.Param(types.DAEMON_ID_PARAM))
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

	err = startServiceGroup(db, group, serviceGroup)
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

// startSubService this function run a group service via compose
func startSubService(c echo.Context) error {

	group := c.Get("group").(types.Group)

	var serviceGroup types.ServiceGroup
	for _, s := range group.Services {
		if s.SubServiceID.Hex() == c.Param(types.SUBSERVICE_ID_PARAM) {
			serviceGroup = s
			break
		}
	}

	if (serviceGroup.SubServiceID == types.ServiceGroup{}.SubServiceID) {
		log.WithFields(log.Fields{
			"groupName":    group.Name,
			"subserviceID": types.SUBSERVICE_ID_PARAM,
		}).Error("Error when retrieving group")
		return c.JSON(http.StatusBadRequest, "The subservice doesn't exist in this group")
	}

	err := startServiceGroup(c.Get("DB").(*storage.Docktor), group, serviceGroup)
	if err != nil {
		log.WithFields(log.Fields{
			"serviceGroup": serviceGroup,
			"error":        err,
		}).Error("Error when starting subservice")
		return err
	}

	return c.JSON(http.StatusOK, serviceGroup)
}

// startServiceGroup this function run a subservice via compose
func startServiceGroup(db *storage.Docktor, group types.Group, serviceGroup types.ServiceGroup) (err error) {

	daemon, err := db.Daemons().FindByIDBson(group.Daemon)
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID":  group.Daemon,
			"groupName": group.Name,
			"error":     err,
		}).Error("Error when retrieving daemon")
		return
	}

	subService, err := db.Services().FindSubServicByIDBson(serviceGroup.SubServiceID)
	if err != nil {
		log.WithFields(log.Fields{
			"subserviceID": serviceGroup.SubServiceID,
			"groupName":    group.Name,
			"daemonID":     group.Daemon,
			"error":        err,
		}).Error("Error when retrieving sub service")
		return
	}

	variables := map[string]interface{}{
		"Group":  group,
		"Daemon": daemon,
	}

	// Copy of variables
	for k, v := range serviceGroup.Variables {
		variables[k] = v
	}

	service, err := subService.ConvertSubService(variables)
	if err != nil {
		log.WithFields(log.Fields{
			"serviceGroup":   serviceGroup.Variables,
			"subServiceName": subService.Name,
			"groupName":      group.Name,
			"daemonHost":     daemon.Host,
			"variables":      serviceGroup.Variables,
			"error":          err,
		}).Error("Error when converting sub service")
		return
	}

	var config config.Config
	if err = yaml.Unmarshal(service, &config); err != nil {
		log.WithFields(log.Fields{
			"service": string(service),
			"error":   err,
		}).Error("Error when unmarshal service")
		return
	}

	if serviceGroup.AutoUpdate {
		// Use https://github.com/v2tec/watchtower
		log.WithFields(log.Fields{
			"config": config,
		}).Infof("Add auto update for %s with watchtower", subService.Name)
		for key := range config.Services {
			if labels, ok := config.Services[key]["labels"]; ok {
				v := reflect.ValueOf(labels)
				config.Services[key]["labels"] = reflect.Append(v, reflect.ValueOf(types.WATCHTOWER_LABEL)).Interface()
			} else {
				config.Services[key]["labels"] = []string{types.WATCHTOWER_LABEL}
			}
		}
		log.WithFields(log.Fields{
			"config": config,
		}).Infof("Configuration updated for %s", subService.Name)
	}

	service, err = yaml.Marshal(config)
	if err != nil {
		log.WithFields(log.Fields{
			"config": config,
			"error":  err,
		}).Error("Error when marshal config")
		return
	}

	log.WithFields(log.Fields{
		"service": string(service),
	}).Info("Sub service converted")

	err = utils.ComposeUp(group.Name, group.Subnet, daemon, [][]byte{service})
	if err != nil {
		log.WithFields(log.Fields{
			"groupName":  group.Name,
			"daemonHost": daemon.Host,
			"service":    string(service),
			"error":      err,
		}).Error("Error when compose up")
		return
	}

	return
}
