package groups

import (
	"net/http"

	"docktor/server/dao"
	"docktor/server/handler/daemons"
	"docktor/server/types"
	"docktor/server/utils"

	dockerTypes "github.com/docker/docker/api/types"
	"github.com/docker/libcompose/labels"
	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// getContainers get containers info starting by group name
func getContainers(c echo.Context) error {

	group := c.Get("group").(types.Group)

	daemon, err := dao.GetDaemonByID(group.DaemonID.Hex())
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": group.DaemonID,
			"error":    err,
		}).Error("Error when retrieving group daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	cs, err := utils.GetContainersStartByName(daemon, group.Name)
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

	daemon, err := dao.GetDaemonByID(group.DaemonID.Hex())
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": group.DaemonID,
			"error":    err,
		}).Error("Error when retrieving group daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	err = utils.CreateContainer(daemon, con)
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

	daemon, err := dao.GetDaemonByID(group.DaemonID.Hex())
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": group.DaemonID,
			"error":    err,
		}).Error("Error when retrieving group daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	cs, err := utils.GetContainersStartByName(daemon, group.Name)
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

	csj, err := utils.InspectContainers(daemon, ids...)
	log.WithFields(log.Fields{
		"ids":    ids,
		"daemon": daemon,
		"error":  err,
	}).Error("Error when retrieving group containers inspect")

	g, err := dao.CreateOrUpdateGroup(types.Group{ID: group.ID, Containers: csj}, true)
	if err != nil {
		log.WithFields(log.Fields{
			"group": g,
			"error": err,
		}).Error("Error when updating/creating group")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, g)
}

func updateContainersStatus(c echo.Context) error {
	group := c.Get("group").(types.Group)
	c.SetParamNames(types.DAEMON_ID_PARAM)
	c.SetParamValues(group.DaemonID.Hex())
	// TODO check if group container
	return daemons.UpdateContainersStatus(c)
}

func getContainerLog(c echo.Context) error {
	group := c.Get("group").(types.Group)
	c.SetParamNames(types.DAEMON_ID_PARAM, types.CONTAINER_ID_PARAM)
	c.SetParamValues(group.DaemonID.Hex(), c.Param(types.CONTAINER_ID_PARAM))
	// TODO check if group container
	return daemons.GetContainerLog(c)
}

func getContainerTerm(c echo.Context) error {
	group := c.Get("group").(types.Group)
	c.SetParamNames(types.DAEMON_ID_PARAM, types.CONTAINER_ID_PARAM)
	c.SetParamValues(group.DaemonID.Hex(), c.Param(types.CONTAINER_ID_PARAM))
	// TODO check if group container
	return daemons.GetContainerTerm(c)
}
