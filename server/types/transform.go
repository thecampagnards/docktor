package types

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/go-connections/nat"
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

// FindServiceName gets the a-priori unique name of a service based on mapped volumes
func FindServiceName(init string, config types.ContainerJSON) string {
	serviceName := init
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
	serviceName := FindServiceName("jenkins", config)
	version := findVersion(config.Config.Image)
	return toSubService(serviceName, version, config, jenkins)
}

// TransformSonarLegacy converts a Docktor V1 Sonar legacy into Docktor V2 service
func TransformSonarLegacy(config types.ContainerJSON, sonar Service) (string, SubService) {
	serviceName := FindServiceName("sonarqube_legacy", config)
	version := findVersion(config.Config.Image)
	return toSubService(serviceName, version, config, sonar)
}

// TransformPhabricator converts a Docktor V1 Phabricator into Docktor V2 service
func TransformPhabricator(config types.ContainerJSON, phab Service) (string, SubService) {
	serviceName := FindServiceName("phabricator", config)
	version := findVersion(config.Config.Image)
	return toSubService(serviceName, version, config, phab)
}

// TransformNexus converts a Docktor V1 Nexus into Docktor V2 service
func TransformNexus(config types.ContainerJSON, nexus Service) (string, SubService) {
	serviceName := FindServiceName("nexus", config)
	version := findVersion(config.Config.Image)
	return toSubService(serviceName, version, config, nexus)
}

// TransformSonarqube converts a Docktor V1 Sonarqube into Docktor V2 service
func TransformSonarqube(config types.ContainerJSON, database types.ContainerJSON, sonarqube Service) (string, SubService) {
	serviceName := FindServiceName("sonarqube", config)
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

// MoveVolumes changes the path of a container's mapped volume
func MoveVolumes(serviceName string, sources []string, groupName string, daemon Daemon) (err error) {
	sourceVolume := fmt.Sprintf("%s/%s", daemon.Docker.Volume, groupName)
	for _, source := range sources {
		cmd := []string{fmt.Sprintf("mv /data/%s /data/%s/", source, serviceName)}
		err = daemon.CmdContainer(sourceVolume, cmd)
		if err != nil {
			return
		}
	}
	return
}

// FindDependency finds the container in a set which is the wanted dependency based on env variables
func FindDependency(conf types.ContainerJSON, refEnv string, refExpr string, nameMatchIndex int, portMatchIndex int, defaultPortValue string, containers []types.ContainerJSON) (*types.ContainerJSON, error) {
	var depName, depPort string
	for _, env := range conf.Config.Env {
		if strings.Contains(env, refEnv) {
			r, _ := regexp.Compile(refExpr)
			match := r.FindStringSubmatch(strings.Split(env, "=")[1])
			depName = match[nameMatchIndex]
			depPort = match[portMatchIndex]
		}
	}
	if depPort == "" {
		return nil, fmt.Errorf("Couldn't find dependency port in %s variables", conf.Name)
	} else if depPort == defaultPortValue {
		for _, c := range containers {
			if strings.TrimPrefix(c.Name, "/") == depName {
				return &c, nil
			}
		}
		return nil, fmt.Errorf("Couldn't find dependency named %s", depName)
	} else {
		port, _ := nat.NewPort("tcp", defaultPortValue)
		for _, c := range containers {
			if len(c.HostConfig.PortBindings[port]) != 0 {
				externalPort := c.HostConfig.PortBindings[port][0].HostPort
				if externalPort == depPort {
					return &c, nil
				}
			}
		}
		return nil, fmt.Errorf("Couldn't find container on port %s", depPort)
	}
}
