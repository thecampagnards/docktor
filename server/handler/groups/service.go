package groups

import (
	"fmt"
	"io/ioutil"
	"net/http"

	"docktor/server/storage"
	"docktor/server/types"

	"github.com/labstack/echo/v4"
	log "github.com/sirupsen/logrus"
)


func saveGroupService(c echo.Context) error {
	group := c.Get("group").(types.Group)
	db := c.Get("DB").(*storage.Docktor)
	serviceName := c.Param(types.GROUPSERVICE_NAME_PARAM)

	for key, service := range group.Services {
		if service.Name == serviceName {
			group.Services[key].File, _ = ioutil.ReadAll(c.Request().Body)
			break
		}
	}

	_, err := db.Groups().Save(group)
	if err != nil {
		log.WithFields(log.Fields{
			"groupName":   group.Name,
			"serviceName": serviceName,
			"error":       err,
		}).Error("Error when saving service")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, "Saved successfully")
}

func getGroupServiceUpdate(c echo.Context) error {
	group := c.Get("group").(types.Group)
	db := c.Get("DB").(*storage.Docktor)
	serviceName := c.Param(types.GROUPSERVICE_NAME_PARAM)

	var groupService types.GroupService
	for _, service := range group.Services {
		if service.Name == serviceName {
			groupService = service
			break
		}
	}
	if groupService.Name == "" {
		return c.JSON(http.StatusBadRequest, fmt.Sprintf("Service with name %s does not exist in group %s", serviceName, group.Name))
	}

	service, err := db.Services().FindBySubServiceID(groupService.SubServiceID.Hex())
	if err != nil {
		return err
	}
	
	var targetSubService types.SubService
	currentSubService, err := service.FindSubServiceByID(groupService.SubServiceID.Hex())
	if err != nil {
		log.Errorln(err)
		return c.JSON(http.StatusBadRequest, fmt.Sprintf("Couldn't find sub-service with ID %s in %s", groupService.SubServiceID.Hex(), service.Name))
	}
	targetIndex := currentSubService.UpdateIndex
	if targetIndex < 0 {
		targetSubService.VersionIndex = 1
		for _, sub := range service.SubServices {
			if sub.VersionIndex > targetSubService.VersionIndex {
				targetSubService = sub
			}
		}
	} else {
		for _, sub := range service.SubServices {
			if sub.VersionIndex == targetIndex {
				targetSubService = sub
			}
		}
	}
	if targetSubService.Name == "" {
		return c.JSON(http.StatusBadRequest, fmt.Sprintf("Couldn't find sub-service with version index %v", targetIndex))
	}

	err = targetSubService.GetVariables()
	if err != nil {
		return err
	}

	for i, v := range targetSubService.Variables {
		for _, variable := range groupService.Variables {
			if v.Name == variable.Name {
				targetSubService.Variables[i].Value = variable.Value
			}
		}
	}

	return c.JSON(http.StatusOK, targetSubService)
}

func updateGroupService(c echo.Context) error {
	group := c.Get("group").(types.Group)
	db := c.Get("DB").(*storage.Docktor)
	serviceName := c.Param(types.GROUPSERVICE_NAME_PARAM)

	var groupServiceIndex int
	var groupService types.GroupService
	for i, service := range group.Services {
		if service.Name == serviceName {
			groupService = service
			groupServiceIndex = i
			break
		}
	}
	if groupService.Name == "" {
		return c.JSON(http.StatusBadRequest, fmt.Sprintf("Service with name %s does not exist in group %s", serviceName, group.Name))
	}

	var subService types.SubService
	err := c.Bind(&subService)
	if err != nil {
		log.WithFields(log.Fields{
			"subService": c.Request().Body,
			"error":     err,
		}).Error("Error when parsing sub-service")
		return c.JSON(http.StatusBadRequest, err)
	}

	service, err := db.Services().FindBySubServiceID(groupService.SubServiceID.Hex())
	if err != nil {
		log.WithFields(log.Fields{
			"subserviceID": groupService.SubServiceID.Hex(),
			"error":        err,
		}).Error("Error when retrieving subservice")
		return c.JSON(http.StatusBadRequest, err.Error())
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

	newService, err := subService.ConvertToGroupService(serviceName, daemon, service, group, groupService.AutoUpdate, []string{})
	if err != nil {
		log.WithFields(log.Fields{
			"serviceGroup": newService,
			"error":        err,
		}).Error("Error when getting compose file of subservice")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	newService.URL = groupService.URL

	// TODO: handle extra hosts ?

	group.Services[groupServiceIndex] = newService
	group, err = db.Groups().Save(group)
	if err != nil {
		log.WithFields(log.Fields{
			"groupName": group.Name,
			"error":     err,
		}).Error("Error when updating group")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	contextName := fmt.Sprintf("%s-%s", group.Name, serviceName)
	err = daemon.ComposeRemove(contextName, [][]byte{groupService.File})
	if err != nil {
		log.WithFields(log.Fields{
			"service": serviceName,
			"error":        err,
		}).Error("Error when removing service")
		return err
	}

	// TODO: check if a script needs to be run (create specific collection in the db)

	err = daemon.ComposeUp(group.Name, serviceName, group.Subnet, [][]byte{newService.File})
	if err != nil {
		log.WithFields(log.Fields{
			"service": serviceName,
			"error":        err,
		}).Error("Error when starting service")
		return err
	}

	return c.JSON(http.StatusOK, newService)
}