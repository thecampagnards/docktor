package groups

import (
	"net/http"
	"strings"

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

func transformServices(c echo.Context) error {
	err := saveContainers(c)
	if err != nil {
		return err
	}

	group := c.Get("group").(types.Group)
	db := c.Get("DB").(*storage.Docktor)

	containerNames := ""
	for _, c := range group.Containers {
		containerNames += c.Name + " "
	}
	log.Infof("Containers to transform : %s", containerNames)

	services, err := db.Services().FindAll()
	if err != nil {
		return err
	}

	daemon, err := db.Daemons().FindByIDBson(group.Daemon)
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": group.Daemon,
			"error":    err,
		}).Error("Error when retrieving group daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	findService := func(services []types.Service, name string) types.Service {
		for _, s := range services {
			if s.Name == name {
				return s
			}
		}
		log.Errorf("Service %s not found", name)
		return types.Service{}
	}

	gs := []types.GroupService{}
	for _, conf := range group.Containers {
		switch true {
		case strings.Contains(conf.Config.Image, "jenkins"):
			service := findService(services, "Jenkins")
			serviceName, sub := types.TransformJenkins(conf, service)
			groupService, err := sub.ConvertToGroupService(serviceName, daemon, service, group, true)
			if err != nil {
				return err
			}
			gs = append(gs, groupService)
			types.MoveVolumes(serviceName, []string{serviceName}, []string{"jenkins"}, group.Name, daemon)
			break
		case strings.Contains(conf.Config.Image, "cdksonarqube"):
			service := findService(services, "Sonarqube")
			serviceName, sub := types.TransformSonarLegacy(conf, service)
			groupService, err := sub.ConvertToGroupService(serviceName, daemon, service, group, false)
			if err != nil {
				return err
			}
			gs = append(gs, groupService)
			types.MoveVolumes(serviceName, []string{serviceName}, []string{"sonarqube"}, group.Name, daemon)
			break
		case strings.Contains(conf.Config.Image, "sonarqube"):
			c, err := types.FindDependency(conf, "SONARQUBE_JDBC_URL", `jdbc:postgresql://([^:]+):([0-9]+)/[a-zA-Z]+`, 1, 2, "5432", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			service := findService(services, "Sonarqube")
			serviceName, sub := types.TransformSonarqube(conf, *c, service)
			groupService, err := sub.ConvertToGroupService(serviceName, daemon, service, group, true)
			if err != nil {
				return err
			}
			gs = append(gs, groupService)
			types.MoveVolumes(serviceName, []string{serviceName, types.FindServiceName("Postgres", *c)}, []string{"sonarqube", "postgres"}, group.Name, daemon)
			break
		case strings.Contains(conf.Config.Image, "nexus"):
			service := findService(services, "Nexus")
			serviceName, sub := types.TransformNexus(conf, service)
			groupService, err := sub.ConvertToGroupService(serviceName, daemon, service, group, false)
			if err != nil {
				return err
			}
			gs = append(gs, groupService)
			types.MoveVolumes(serviceName, []string{serviceName}, []string{"nexus"}, group.Name, daemon)
			break
		case strings.Contains(conf.Config.Image, "cdkintools2"):
			mongo, err := types.FindDependency(conf, "MONGO_URL", `mongodb://([^:]+):([0-9]+)`, 1, 2, "27017", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			redis, err := types.FindDependency(conf, "REDIS_URL", `([^:]+):([0-9]+)`, 1, 2, "6379", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			service := findService(services, "Intools")
			serviceName, sub := types.TransformIntools2(conf, *mongo, *redis, service)
			groupService, err := sub.ConvertToGroupService(serviceName, daemon, service, group, false)
			if err != nil {
				return err
			}
			gs = append(gs, groupService)
			types.MoveVolumes(serviceName, []string{serviceName, types.FindServiceName("MongoDB", *mongo)}, []string{"intools", "mongodb"}, group.Name, daemon)
			break
		case strings.Contains(conf.Config.Image, "cdkintools"):
			service := findService(services, "Intools")
			serviceName, sub := types.TransformIntools1(conf, service)
			groupService, err := sub.ConvertToGroupService(serviceName, daemon, service, group, false)
			if err != nil {
				return err
			}
			gs = append(gs, groupService)
			types.MoveVolumes(serviceName, []string{serviceName}, []string{"intools"}, group.Name, daemon)
			break
		case strings.Contains(conf.Config.Image, "intools"):
			mongo, err := types.FindDependency(conf, "MONGO_SERVER", `([^:]+):([0-9]+)`, 1, 2, "27017", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			redis, err := types.FindDependency(conf, "REDIS_HOST", `([^:]+):([0-9]+)`, 1, 2, "6379", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			service := findService(services, "Intools")
			serviceName, sub := types.TransformIntools3(conf, *mongo, *redis, service)
			groupService, err := sub.ConvertToGroupService(serviceName, daemon, service, group, false)
			if err != nil {
				return err
			}
			gs = append(gs, groupService)
			types.MoveVolumes(serviceName, []string{serviceName, types.FindServiceName("MongoDB", *mongo)}, []string{"intools", "mongodb"}, group.Name, daemon)
			break
		case strings.Contains(conf.Config.Image, "phabricator"):
			service := findService(services, "Phabricator")
			serviceName, sub := types.TransformPhabricator(conf, service)
			groupService, err := sub.ConvertToGroupService(serviceName, daemon, service, group, false)
			if err != nil {
				return err
			}
			gs = append(gs, groupService)
			types.MoveVolumes(serviceName, []string{serviceName}, []string{"phabricator"}, group.Name, daemon)
			break
		default:
			log.Warningf("No match found for image : %s", conf.Config.Image)
		}
	}

	return c.JSON(http.StatusOK, gs)
}
