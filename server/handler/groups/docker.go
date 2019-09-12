package groups

import (
	"net/http"

	"docktor/server/storage"
	"docktor/server/types"

	"github.com/docker/libcompose/labels"
	"github.com/labstack/echo/v4"
	log "github.com/sirupsen/logrus"
)

// getContainers get containers info starting by group name
func getContainers(c echo.Context) error {

	group := c.Get("group").(types.Group)
	db := c.Get("DB").(*storage.Docktor)

	daemon, err := db.Daemons().FindByIDBson(group.Daemon)
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": group.Daemon,
			"error":    err,
		}).Error("Error when retrieving group daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	cs, err := daemon.GetContainersStartByName(group.Name)
	if err != nil {
		log.WithFields(log.Fields{
			"daemon": daemon.Name,
			"error":  err,
		}).Error("Error when retrieving group daemon containers")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, cs)
}

// saveContainers save the containers of group
func saveContainers(c echo.Context) error {

	group := c.Get("group").(types.Group)

	db := c.Get("DB").(*storage.Docktor)
	daemon, err := db.Daemons().FindByIDBson(group.Daemon)
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": group.Daemon,
			"error":    err,
		}).Error("Error when retrieving group daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	cs, err := daemon.GetContainersStartByName(group.Name)
	if err != nil {
		log.WithFields(log.Fields{
			"daemon": daemon.Name,
			"error":  err,
		}).Error("Error when retrieving group daemon containers")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	var ids []string
	for _, container := range cs {
		// Save only docker containers and not composed containers
		if container.Labels[labels.PROJECT.Str()] == "" {
			ids = append(ids, container.ID)
		}
	}

	csj, err := daemon.InspectContainers(ids...)
	log.WithFields(log.Fields{
		"ids":    ids,
		"daemon": daemon.Name,
		"error":  err,
	}).Error("Error when retrieving group containers inspect")

	// append or update containers of the group
	group.AppendOrUpdate(csj)

	_, err = db.Groups().Save(group)
	if err != nil {
		log.WithFields(log.Fields{
			"groupID": group.ID,
			"error":   err,
		}).Error("Error when updating/creating group")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, "ok")
}
