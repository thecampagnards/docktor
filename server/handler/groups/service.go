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

func updateGroupService(c echo.Context) error {
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

	var targetIndex int
	var targetSubService types.SubService
	for _, sub := range service.SubServices {
		if sub.ID == groupService.SubServiceID {
			targetIndex = sub.UpdateIndex
		}
	}
	if targetIndex == 0 {
		return c.JSON(http.StatusBadRequest, fmt.Sprintf("Couldn't find sub-service with ID %s in %s", groupService.SubServiceID.Hex(), service.Name))
	} else if targetIndex < 0 {
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