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
		match := false
		for _, v := range env {
			entry := strings.SplitN(v, "=", 2)
			if len(entry) != 2 {
				log.Errorf("Invalid entry : %+v", entry)
				continue
			}
			if strings.Contains(sub.Variables[i].Name, strings.ToLower(entry[0])) {
				log.Infof("Variable %s = %s", sub.Variables[i].Name, entry[1])
				sub.Variables[i].Value = entry[1]
				match = true
				break
			}
		}
		if !match {
			log.Warningf("Didn't find env variable for %s in source container configuration", sub.Variables[i].Name)
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

// TransformIntools3 converts a Docktor V1 Intools 3 into Docktor V2 service
func TransformIntools3(config types.ContainerJSON, mongo types.ContainerJSON, redis types.ContainerJSON, intools Service) (string, SubService) {
	serviceName := FindServiceName("intools", config)
	version := findVersion(config.Config.Image)
	return toSubService(serviceName, version, config, intools)
}

// TransformIntools2 converts a Docktor V1 Intools 2 into Docktor V2 service
func TransformIntools2(config types.ContainerJSON, mongo types.ContainerJSON, redis types.ContainerJSON, intools Service) (string, SubService) {
	serviceName := FindServiceName("intools2", config)
	version := findVersion(config.Config.Image)
	return toSubService(serviceName, version, config, intools)
}

// TransformIntools1 converts a Docktor V1 Intools 1 into Docktor V2 service
func TransformIntools1(config types.ContainerJSON, intools Service) (string, SubService) {
	serviceName := FindServiceName("intools1", config)
	version := findVersion(config.Config.Image)
	return toSubService(serviceName, version, config, intools)
}

func toSubService(serviceName string, version string, config types.ContainerJSON, service Service) (string, SubService) {
	for _, sub := range service.SubServices {
		if strings.Contains(sub.File, version) {
			log.Infof("Transforming %s service %s version %s ...", service.Name, config.Name, version)
			sub.GetVariables()
			importVariables(&sub, config.Config.Env)
			return serviceName, sub
		}
	}
	log.Warningf("Version %s not found for service %s", version, service.Name)
	return serviceName, SubService{}
}

// MoveVolumes changes the path of a container's mapped volume
func MoveVolumes(serviceName string, sources []string, targets []string, groupName string, daemon Daemon) (err error) {
	sourceVolume := fmt.Sprintf("%s/%s", daemon.Docker.Volume, groupName)
	tmpServiceDir := fmt.Sprintf("%s-v2", serviceName)

	// Initialize commands
	cdCmd := "cd /data"
	mkdirCmd := fmt.Sprintf("mkdir %s", tmpServiceDir)
	moveCmd := ""
	for k, source := range sources {
		moveCmd += fmt.Sprintf("mv %s %s/%s ", source, tmpServiceDir, targets[k])
	}
	renameCmd := fmt.Sprintf("mv %s %s", tmpServiceDir, serviceName)

	fullCmd := cdCmd + " && " + mkdirCmd + " && " + moveCmd + " && " + renameCmd
	log.Infof("Full command to move volumes : %s", fullCmd)

	cmd := []string{"sh", "-c", fullCmd}
	err = daemon.CmdContainer(sourceVolume, cmd)

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
