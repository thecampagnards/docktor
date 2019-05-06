package groups

import (
	"net/http"

	"docktor/server/storage"
	"docktor/server/types"

	dockerTypes "github.com/docker/docker/api/types"
	"github.com/docker/libcompose/labels"
	"github.com/labstack/echo"
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
			"daemon": daemon,
			"error":  err,
		}).Error("Error when retrieving group daemon containers")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, cs)
}

// createContainer create a container which are in the containers group
func createContainer(c echo.Context) error {

	group := c.Get("group").(types.Group)

	var con dockerTypes.ContainerJSON
	for _, container := range group.Containers {
		if container.ID == c.Param(types.CONTAINER_ID_PARAM) {
			con = container
			break
		}
		if container.Name == c.Param(types.CONTAINER_ID_PARAM) {
			con = container
			break
		}
	}

	if con.ID == "" {
		log.WithFields(log.Fields{
			"container": con,
		}).Error("Unknown container")
		return c.JSON(http.StatusBadRequest, "Unknown container")
	}

	db := c.Get("DB").(*storage.Docktor)
	daemon, err := db.Daemons().FindByIDBson(group.Daemon)
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": group.Daemon,
			"error":    err,
		}).Error("Error when retrieving group daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	err = daemon.CreateContainer(con)
	if err != nil {
		log.WithFields(log.Fields{
			"daemon":    daemon.Host,
			"container": con,
			"error":     err,
		}).Error("Error when creating group daemon container")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, "ok")
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
			"daemon": daemon,
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
		"daemon": daemon,
		"error":  err,
	}).Error("Error when retrieving group containers inspect")

	_, err = db.Groups().Save(types.Group{GroupLight: types.GroupLight{ID: group.ID}, GroupDocker: types.GroupDocker{Containers: csj}})
	if err != nil {
		log.WithFields(log.Fields{
			"groupID": group.ID,
			"error":   err,
		}).Error("Error when updating/creating group")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, "ok")
}
