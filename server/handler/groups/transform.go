package groups

import (
	"fmt"
	"net/http"
	"strings"
	
	"docktor/server/storage"
	"docktor/server/types"
	
	"github.com/labstack/echo/v4"
	log "github.com/sirupsen/logrus"
)

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

	for _, conf := range group.Containers {
		switch true {
		case strings.Contains(conf.Config.Image, "jenkins"):
			service := findService(services, "Jenkins")
			serviceName, sub := types.TransformService(conf, service, "jenkins")
			group, err = createGroupService(service, sub, serviceName, group, daemon, db)
			if err != nil {
				log.Errorf("Failed to create group service for %s", conf.Name)
			}
			errs := daemon.RemoveContainers(conf.Name)
			if len(errs) > 0 {
				return fmt.Errorf("%+v", errs)
			}
			err = types.MoveVolumes(serviceName, []string{serviceName}, []string{"jenkins"}, group.Name, daemon)
			if err != nil {
				log.Error(err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "cdksonarqube"):
			service := findService(services, "SonarQube")
			serviceName, sub := types.TransformService(conf, service, "sonarqube")
			group, err = createGroupService(service, sub, serviceName, group, daemon, db)
			if err != nil {
				log.Errorf("Failed to create group service for %s", conf.Name)
			}
			errs := daemon.RemoveContainers(conf.Name)
			if len(errs) > 0 {
				return fmt.Errorf("%+v", errs)
			}
			err = types.MoveVolumes(serviceName, []string{serviceName}, []string{"sonarqube"}, group.Name, daemon)
			if err != nil {
				log.Error(err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "sonarqube"):
			c, err := types.FindDependencyEnv(conf, "SONARQUBE_JDBC_URL", `jdbc:postgresql://([^:]+):([0-9]+)/[a-zA-Z]+`, 1, 2, "5432", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			service := findService(services, "SonarQube")
			serviceName, sub := types.TransformService(conf, service, "sonarqube")
			group, err = createGroupService(service, sub, serviceName, group, daemon, db)
			if err != nil {
				log.Errorf("Failed to create group service for %s", conf.Name)
			}
			errs := daemon.RemoveContainers(c.Name, conf.Name)
			if len(errs) > 0 {
				return fmt.Errorf("%+v", errs)
			}
			err = types.MoveVolumes(serviceName, []string{serviceName, types.FindServiceName("Postgres", *c)}, []string{"sonarqube", "postgres"}, group.Name, daemon)
			if err != nil {
				log.Error(err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "nexus"):
			service := findService(services, "Nexus")
			serviceName, sub := types.TransformService(conf, service, "nexus")
			group, err = createGroupService(service, sub, serviceName, group, daemon, db)
			if err != nil {
				log.Errorf("Failed to create group service for %s", conf.Name)
			}
			errs := daemon.RemoveContainers(conf.Name)
			if len(errs) > 0 {
				return fmt.Errorf("%+v", errs)
			}
			err = types.MoveVolumes(serviceName, []string{serviceName}, []string{"nexus"}, group.Name, daemon)
			if err != nil {
				log.Error(err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "cdkintools2"):
			mongo, err := types.FindDependencyEnv(conf, "MONGO_URL", `mongodb://([^:]+):([0-9]+)`, 1, 2, "27017", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			redis, err := types.FindDependencyEnv(conf, "REDIS_URL", `([^:]+):([0-9]+)`, 1, 2, "6379", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			service := findService(services, "Intools")
			serviceName, sub := types.TransformService(conf, service, "Intools2")
			group, err = createGroupService(service, sub, serviceName, group, daemon, db)
			if err != nil {
				log.Errorf("Failed to create group service for %s", conf.Name)
			}
			errs := daemon.RemoveContainers(mongo.Name, redis.Name, conf.Name)
			if len(errs) > 0 {
				return fmt.Errorf("%+v", errs)
			}
			err = types.MoveVolumes(serviceName, []string{serviceName, types.FindServiceName("MongoDB", *mongo)}, []string{"intools", "mongo"}, group.Name, daemon)
			if err != nil {
				log.Error(err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "cdkintools"):
			service := findService(services, "Intools")
			serviceName, sub := types.TransformService(conf, service, "intools")
			group, err = createGroupService(service, sub, serviceName, group, daemon, db)
			if err != nil {
				log.Errorf("Failed to create group service for %s", conf.Name)
			}
			errs := daemon.RemoveContainers(conf.Name)
			if len(errs) > 0 {
				return fmt.Errorf("%+v", errs)
			}
			err = types.MoveVolumes(serviceName, []string{serviceName}, []string{"intools"}, group.Name, daemon)
			if err != nil {
				log.Error(err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "intools"):
			mongo, err := types.FindDependencyEnv(conf, "MONGO_SERVER", `([^:]+):([0-9]+)`, 1, 2, "27017", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			redis, err := types.FindDependencyEnv(conf, "REDIS_HOST", `([^:]+):([0-9]+)`, 1, 2, "6379", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			service := findService(services, "Intools")
			serviceName, sub := types.TransformService(conf, service, "intools")
			group, err = createGroupService(service, sub, serviceName, group, daemon, db)
			if err != nil {
				log.Errorf("Failed to create group service for %s", conf.Name)
			}
			errs := daemon.RemoveContainers(mongo.Name, redis.Name, conf.Name)
			if len(errs) > 0 {
				return fmt.Errorf("%+v", errs)
			}
			err = types.MoveVolumes(serviceName, []string{serviceName, types.FindServiceName("MongoDB", *mongo)}, []string{"intools", "mongo"}, group.Name, daemon)
			if err != nil {
				log.Error(err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "phabricator"):
			service := findService(services, "Phabricator")
			serviceName, sub := types.TransformService(conf, service, "phabricator")
			group, err = createGroupService(service, sub, serviceName, group, daemon, db)
			if err != nil {
				log.Errorf("Failed to create group service for %s", conf.Name)
			}
			errs := daemon.RemoveContainers(conf.Name)
			if len(errs) > 0 {
				return fmt.Errorf("%+v", errs)
			}
			err = types.MoveVolumes(serviceName, []string{serviceName}, []string{"phabricator"}, group.Name, daemon)
			if err != nil {
				log.Error(err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "rundeck"):
			databaseEnv := "RUNDECK_DATABASE_URL"
			if strings.Contains(conf.Config.Image, "cdkrundeck") {
				databaseEnv = "DATABASE_URL"
			}
			c, err := types.FindDependencyEnv(conf, databaseEnv, `jdbc:postgresql://([^:]+):([0-9]+)/[a-zA-Z]+`, 1, 2, "5432", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			service := findService(services, "Rundeck")
			serviceName, sub := types.TransformService(conf, service, "rundeck")
			group, err = createGroupService(service, sub, serviceName, group, daemon, db)
			if err != nil {
				log.Errorf("Failed to create group service for %s", conf.Name)
			}
			errs := daemon.RemoveContainers(c.Name, conf.Name)
			if len(errs) > 0 {
				return fmt.Errorf("%+v", errs)
			}
			err = types.MoveVolumes(serviceName, []string{serviceName, types.FindServiceName("Postgres", *c)}, []string{"rundeck", "postgres"}, group.Name, daemon)
			if err != nil {
				log.Error(err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "ctm"):
			esURL := ":"
			for _, env := range conf.Config.Env {
				if strings.Contains(env, "ES_HOST") {
					esURL = strings.Split(env, "=")[1] + esURL
				}
				if strings.Contains(env, "ES_PORT") {
					esURL += strings.Split(env, "=")[1]
				}
			}
			es, err := types.FindDependency(esURL, `([^:]+):([0-9]+)`, 1, 2, "9300", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			service := findService(services, "CTM")
			serviceName, sub := types.TransformService(conf, service, "ctm")
			group, err = createGroupService(service, sub, serviceName, group, daemon, db)
			if err != nil {
				log.Errorf("Failed to create group service for %s", conf.Name)
			}
			errs := daemon.RemoveContainers(es.Name, conf.Name)
			if len(errs) > 0 {
				return fmt.Errorf("%+v", errs)
			}
			err = types.MoveVolumes(serviceName, []string{serviceName, types.FindServiceName("elasticsearch", *es)}, []string{"ctm", "elasticsearch"}, group.Name, daemon)
			if err != nil {
				log.Error(err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "release-monitoring-2"):
			esURL := ":"
			for _, env := range conf.Config.Env {
				if strings.Contains(env, "ES_HOST") {
					esURL = strings.Split(env, "=")[1] + esURL
				}
				if strings.Contains(env, "ES_PORT") {
					esURL += strings.Split(env, "=")[1]
				}
			}
			es, err := types.FindDependency(esURL, `([^:]+):([0-9]+)`, 1, 2, "9300", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			service := findService(services, "ReleaseMonitoring2")
			serviceName, sub := types.TransformService(conf, service, "release-monitoring")
			group, err = createGroupService(service, sub, serviceName, group, daemon, db)
			if err != nil {
				log.Errorf("Failed to create group service for %s", conf.Name)
			}
			errs := daemon.RemoveContainers(es.Name, conf.Name)
			if len(errs) > 0 {
				return fmt.Errorf("%+v", errs)
			}
			err = types.MoveVolumes(serviceName, []string{serviceName, types.FindServiceName("elasticsearch", *es)}, []string{"release-monitoring", "elasticsearch"}, group.Name, daemon)
			if err != nil {
				log.Error(err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "cdkplaylogs"):
			esURL := ":"
			for _, env := range conf.Config.Env {
				if strings.Contains(env, "ELASTICSEARCH_URL") {
					esURL = strings.Split(env, "=")[1] + esURL
				}
				if strings.Contains(env, "ELASTICSEARCH_REST_API_PORT") {
					esURL += strings.Split(env, "=")[1]
				}
			}
			es, err := types.FindDependency(esURL, `([^:]+):([0-9]+)`, 1, 2, "9200", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			mongo, err := types.FindDependencyEnv(conf, "MONGO_URL", `([^:]+):([0-9]+)`, 1, 2, "27017", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			service := findService(services, "Playlogs")
			serviceName, sub := types.TransformService(conf, service, "playlogs")
			group, err = createGroupService(service, sub, serviceName, group, daemon, db)
			if err != nil {
				log.Errorf("Failed to create group service for %s", conf.Name)
			}
			errs := daemon.RemoveContainers(es.Name, mongo.Name, conf.Name)
			if len(errs) > 0 {
				return fmt.Errorf("%+v", errs)
			}
			err = types.MoveVolumes(serviceName, []string{serviceName, types.FindServiceName("elasticsearch", *es), types.FindServiceName("MongoDB", *mongo)}, []string{"playlogs", "elasticsearch", "mongo"}, group.Name, daemon)
			if err != nil {
				log.Error(err.Error())
			}
			break
		// TODO : case Shinken, Zap, SSO
		default:
			log.Warningf("No match found for image : %s", conf.Config.Image)
		}
	}

	return c.JSON(http.StatusOK, group)
}

func createGroupService(service types.Service, sub types.SubService, serviceName string, group types.Group, daemon types.Daemon, db *storage.Docktor) (types.Group, error) {
	groupService, err := sub.ConvertToGroupService(serviceName, daemon, service, group, false)
	if err != nil {
		return types.Group{}, err
	}
	group.Services = append(group.Services, groupService)
	group, err = db.Groups().Save(group)
	if err != nil {
		log.Errorln("Error when saving group. Copy the JSON manually into the DB :")
		log.Errorln(groupService)
	}
	return group, nil
}