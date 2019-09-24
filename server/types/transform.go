package types

import (
	"regexp"
	"strings"

	"github.com/docker/docker/api/types"
	log "github.com/sirupsen/logrus"
)

func importVariables(sub *SubService, env []string) {
	for i := 0; i < len(sub.Variables); i++ {
		for _, v := range env {
			if strings.Contains(strings.ToLower(v), sub.Variables[i].Name) {
				value := strings.Split(v, "=")[1]
				log.Infof("Variable %s = %s", sub.Variables[i].Name, value)
				sub.Variables[i].Value = value
			}
		}
	}
}

func findServiceName(init string, config types.ContainerJSON) string {
	serviceName := "jenkins"
	for _, mount := range config.Mounts {
		if strings.Contains(mount.Source, "/data/") {
			serviceName = strings.Split(mount.Source, "/")[3]
		}
	}
	return serviceName
}

func findVersion(image string) string {
	r, _ := regexp.Compile(`[^:]+:([^-]+)(-[.*]+)?`)
	return r.FindStringSubmatch(image)[1]
}

// TransformJenkins converts a Docktor V1 Jenkins into Docktor V2 service
func TransformJenkins(config types.ContainerJSON, jenkins Service) (string, SubService) {
	serviceName := findServiceName("jenkins", config)
	version := findVersion(config.Config.Image)
	return toSubService(serviceName, version, config, jenkins)
}

// TransformSonarLegacy converts a Docktor V1 Sonar legacy into Docktor V2 service
func TransformSonarLegacy(config types.ContainerJSON, sonar Service) (string, SubService) {
	serviceName := findServiceName("sonarqube_legacy", config)
	version := findVersion(config.Config.Image)
	return toSubService(serviceName, version, config, sonar)
}

// TransformPhabricator converts a Docktor V1 Phabricator into Docktor V2 service
func TransformPhabricator(config types.ContainerJSON, phab Service) (string, SubService) {
	serviceName := findServiceName("phabricator", config)
	version := findVersion(config.Config.Image)
	return toSubService(serviceName, version, config, phab)
}

// TransformNexus converts a Docktor V1 Nexus into Docktor V2 service
func TransformNexus(config types.ContainerJSON, nexus Service) (string, SubService) {
	serviceName := findServiceName("nexus", config)
	version := findVersion(config.Config.Image)
	return toSubService(serviceName, version, config, nexus)
}

// TransformSonarqube converts a Docktor V1 Sonarqube into Docktor V2 service
func TransformSonarqube(config types.ContainerJSON, database types.ContainerJSON, sonarqube Service) (string, SubService) {
	serviceName := findServiceName("sonarqube", config)
	version := findVersion(config.Config.Image)
	return toSubService(serviceName, version, config, sonarqube)
}

func toSubService(serviceName string, version string, config types.ContainerJSON, service Service) (string, SubService) {
	for _, sub := range service.SubServices {
		if strings.Contains(sub.File, version) {
			log.Infof("Transforming %s service %s version %s ...", service.Name, config.Name, version)
			// Get template
			sub.GetVariables()
			// Set variable values
			importVariables(&sub, config.Config.Env)
			return serviceName, sub
		}
	}
	return serviceName, SubService{}
}
