package types

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/go-connections/nat"
	log "github.com/sirupsen/logrus"
)

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

// FindDependencyEnv finds the environment variable that contains the dependency data
func FindDependencyEnv(conf types.ContainerJSON, refEnv string, refExpr string, nameMatchIndex int, portMatchIndex int, defaultPortValue string, containers []types.ContainerJSON) (*types.ContainerJSON, error) {
	for _, env := range conf.Config.Env {
		if strings.Contains(env, refEnv) {
			return FindDependency(strings.SplitN(env, "=", 2)[1], refExpr, nameMatchIndex, portMatchIndex, defaultPortValue, containers)
		}
	}
	return nil, fmt.Errorf("Couldn't find dependency variable in %s envs", conf.Name)
}

// FindDependency finds the container in a set which is the wanted dependency based on env variables
func FindDependency(expr string, refExpr string, nameMatchIndex int, portMatchIndex int, defaultPortValue string, containers []types.ContainerJSON) (*types.ContainerJSON, error) {
	var depName, depPort string

	r, _ := regexp.Compile(refExpr)
	match := r.FindStringSubmatch(expr)
	depName = match[nameMatchIndex]
	depPort = match[portMatchIndex]

	if depPort == "" || depName == "" {
		return nil, fmt.Errorf("Couldn't find dependency location in variable %q", expr)
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

func findVersion(image string) string {
	r, _ := regexp.Compile(`[^:]+:([^-]+)(-[.*]+)?`)
	return r.FindStringSubmatch(image)[1]
}

// TransformService converts a Docktor V1 into Docktor V2 service
func TransformService(config types.ContainerJSON, service Service, defaultName string) (string, SubService) {
	serviceName := FindServiceName(defaultName, config)
	version := findVersion(config.Config.Image)
	return toSubService(serviceName, version, config, service)
}

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
func MoveVolumes(serviceName string, volumes map[string]string, groupName string, daemon Daemon) (err error) {
	sourceVolume := fmt.Sprintf("%s/%s", daemon.Docker.Volume, groupName)
	tmpServiceDir := fmt.Sprintf("%s-%s", serviceName, randString(8))

	// Initialize commands
	cdCmd := "cd /data && "
	mkdirCmd := fmt.Sprintf("mkdir %s && ", tmpServiceDir)
	moveCmd := ""
	for key, value := range volumes {
		moveCmd += fmt.Sprintf("mv %s %s/%s && ", key, tmpServiceDir, value)
	}
	renameCmd := fmt.Sprintf("mv %s %s", tmpServiceDir, serviceName)

	fullCmd := cdCmd + mkdirCmd + moveCmd + renameCmd
	log.Infof("Full command to move volumes : %s", fullCmd)

	cmd := []string{"sh", "-c", fullCmd}
	err = daemon.CmdContainer(sourceVolume, cmd)

	return
}