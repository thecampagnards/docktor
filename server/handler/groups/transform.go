package groups

import (
	"fmt"
	"net/http"
	"strings"
	
	"docktor/server/storage"
	"docktor/server/types"
	
	docker "github.com/docker/docker/api/types"
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

	noDependency := map[string]*docker.ContainerJSON{}

	for _, conf := range group.Containers {
		switch true {
		case strings.Contains(conf.Config.Image, "jenkins"): // --- Jenkins ---
			service, err := services.FindByName("jenkins")
			if err != nil {
				log.WithField("services", services).Errorln(err)
				break
			}
			err = handleServiceTransform(conf, noDependency, service, "jenkins", group, daemon, db)
			if err != nil {
				log.Errorf("Failed to transform %s - %s", conf.Name, err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "cdksonarqube"): // --- Sonarqube 6- ---
			service, err := services.FindByName("sonarqube")
			if err != nil {
				log.WithField("services", services).Errorln(err)
				break
			}
			err = handleServiceTransform(conf, noDependency, service, "sonarqube", group, daemon, db)
			if err != nil {
				log.Errorf("Failed to transform %s - %s", conf.Name, err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "sonarqube"): // --- Sonarqube 7+ ---
			c, err := types.FindDependencyEnv(conf, "SONARQUBE_JDBC_URL", `jdbc:postgresql://([^:]+):([0-9]+)/[a-zA-Z]+`, 1, 2, "5432", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			dependencies := map[string]*docker.ContainerJSON{
				"Postgres": c,
			}
			service, err := services.FindByName("sonarqube")
			if err != nil {
				log.WithField("services", services).Errorln(err)
				break
			}
			err = handleServiceTransform(conf, dependencies, service, "sonarqube", group, daemon, db)
			if err != nil {
				log.Errorf("Failed to transform %s - %s", conf.Name, err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "nexus"): // --- Nexus ---
			service, err := services.FindByName("nexus")
			if err != nil {
				log.WithField("services", services).Errorln(err)
				break
			}
			err = handleServiceTransform(conf, noDependency, service, "nexus", group, daemon, db)
			if err != nil {
				log.Errorf("Failed to transform %s - %s", conf.Name, err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "cdkintools2"): // --- Intools 2 ---
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
			dependencies := map[string]*docker.ContainerJSON{
				"MongoDB": mongo,
				"REDIS": redis,
			}
			service, err := services.FindByName("intools")
			if err != nil {
				log.WithField("services", services).Errorln(err)
				break
			}
			err = handleServiceTransform(conf, dependencies, service, "Intools2", group, daemon, db)
			if err != nil {
				log.Errorf("Failed to transform %s - %s", conf.Name, err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "cdkintools"): // --- Intools 1 ---
			service, err := services.FindByName("intools")
			if err != nil {
				log.WithField("services", services).Errorln(err)
				break
			}
			handleServiceTransform(conf, noDependency, service, "intools", group, daemon, db)
			if err != nil {
				log.Errorf("Failed to transform %s - %s", conf.Name, err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "intools"): // --- Intools 3 ---
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
			dependencies := map[string]*docker.ContainerJSON{
				"MongoDB": mongo,
				"REDIS": redis,
			}
			service, err := services.FindByName("intools")
			if err != nil {
				log.WithField("services", services).Errorln(err)
				break
			}
			err = handleServiceTransform(conf, dependencies, service, "intools", group, daemon, db)
			if err != nil {
				log.Errorf("Failed to transform %s - %s", conf.Name, err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "phabricator"): // --- Phabricator ---
			service, err := services.FindByName("phabricator")
			if err != nil {
				log.WithField("services", services).Errorln(err)
				break
			}
			err = handleServiceTransform(conf, noDependency, service, "phabricator", group, daemon, db)
			if err != nil {
				log.Errorf("Failed to transform %s - %s", conf.Name, err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "rundeck"): // --- Rundeck ---
			databaseEnv := "RUNDECK_DATABASE_URL"
			if strings.Contains(conf.Config.Image, "cdkrundeck") {
				databaseEnv = "DATABASE_URL"
			}
			c, err := types.FindDependencyEnv(conf, databaseEnv, `jdbc:postgresql://([^:]+):([0-9]+)/[a-zA-Z]+`, 1, 2, "5432", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			dependencies := map[string]*docker.ContainerJSON{
				"Postgres": c,
			}
			service, err := services.FindByName("rundeck")
			if err != nil {
				log.WithField("services", services).Errorln(err)
				break
			}
			err = handleServiceTransform(conf, dependencies, service, "rundeck", group, daemon, db)
			if err != nil {
				log.Errorf("Failed to transform %s - %s", conf.Name, err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "ctm"): // --- CTM ---
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
			dependencies := map[string]*docker.ContainerJSON{
				"elasticsearch": es,
			}
			service, err := services.FindByName("ctm")
			if err != nil {
				log.WithField("services", services).Errorln(err)
				break
			}
			err = handleServiceTransform(conf, dependencies, service, "ctm", group, daemon, db)
			if err != nil {
				log.Errorf("Failed to transform %s - %s", conf.Name, err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "release-monitoring-2"): // --- RM2 ---
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
			dependencies := map[string]*docker.ContainerJSON{
				"elasticsearch": es,
			}
			service, err := services.FindByName("releasemonitoring2")
			if err != nil {
				log.WithField("services", services).Errorln(err)
				break
			}
			err = handleServiceTransform(conf, dependencies, service, "ReleaseMonitoring2", group, daemon, db)
			if err != nil {
				log.Errorf("Failed to transform %s - %s", conf.Name, err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "cdkplaylogs"): // --- Playlogs ---
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
			dependencies := map[string]*docker.ContainerJSON{
				"elasticsearch": es,
				"MongoDB": mongo,
			}
			service, err := services.FindByName("playlogs")
			if err != nil {
				log.WithField("services", services).Errorln(err)
				break
			}
			err = handleServiceTransform(conf, dependencies, service, "playlogs", group, daemon, db)
			if err != nil {
				log.Errorf("Failed to transform %s - %s", conf.Name, err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "cdk/zap"): // --- ZAP ---
			service, err := services.FindByName("zap")
			if err != nil {
				log.WithField("services", services).Errorln(err)
				break
			}
			err = handleServiceTransform(conf, noDependency, service, "ZAP", group, daemon, db)
			if err != nil {
				log.Errorf("Failed to transform %s - %s", conf.Name, err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "cdk/sso"): // --- SSO ---
			service, err := services.FindByName("sso")
			if err != nil {
				log.WithField("services", services).Errorln(err)
				break
			}
			err = handleServiceTransform(conf, noDependency, service, "SSO", group, daemon, db)
			if err != nil {
				log.Errorf("Failed to transform %s - %s", conf.Name, err.Error())
			}
			break
		case strings.Contains(conf.Config.Image, "shinken"): // --- Shinken/Grafana ---
			var grafana *docker.ContainerJSON
			for _, c := range group.Containers {
				if strings.Contains(c.Config.Image, "grafana") {
					grafana = &c
				}
			}
			database, err := types.FindDependencyEnv(conf, "INFLUXDB_HOST", `([^:]+):([0-9]+)`, 1, 2, "8086", group.Containers)
			if err != nil {
				log.Error(err.Error())
				break
			}
			dependencies := map[string]*docker.ContainerJSON{
				"Grafana": grafana,
				"influxdb": database,
			}
			service, err := services.FindByName("shinken")
			if err != nil {
				log.WithField("services", services).Errorln(err)
				break
			}
			err = handleServiceTransform(conf, dependencies, service, "SHINKEN", group, daemon, db)
			if err != nil {
				log.Errorf("Failed to transform %s - %s", conf.Name, err.Error())
			}
			break
		default:
			log.Warningf("No match found for image : %s", conf.Config.Image)
		}
	}

	return c.JSON(http.StatusOK, group)
}

func handleServiceTransform(conf docker.ContainerJSON, dependencies map[string]*docker.ContainerJSON, service types.Service, defaultName string, group types.Group, daemon types.Daemon, db *storage.Docktor) (error) {
	// Convert V1 to V2 service
	serviceName, sub := types.TransformService(conf, service, defaultName)
	groupService, err := sub.ConvertToGroupService(serviceName, daemon, service, group, false)
	if err != nil {
		log.Errorf("Failed to create group service for %s", conf.Name)
		return err
	}
	// Update group in the database
	group.Services = append(group.Services, groupService)
	group, err = db.Groups().Save(group)
	if err != nil {
		log.Errorln("Error when saving group. Copy the JSON manually into the DB :")
		log.Errorln(groupService)
		return err
	}
	// Remove containers on the machine
	errs := daemon.RemoveContainers(conf.Name)
	if len(errs) > 0 {
		return fmt.Errorf("%+v", errs)
	}
	// Move volumes of all containers of the services in the same service directory
	var volumes map[string]string
	if len(dependencies) == 0 {
		volumes[serviceName] = ""
	} else {
		volumes[serviceName] = strings.ToLower(defaultName)
		for name, c := range dependencies {
			source := types.FindServiceName(name, *c)
			volumes[source] = strings.ToLower(name)
		}
	}
	err = types.MoveVolumes(serviceName, volumes, group.Name, daemon)
	if err != nil {
		return err
	}
	return nil
}