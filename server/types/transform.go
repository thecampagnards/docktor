package types

import (
	"regexp"
	"strings"

	"github.com/docker/docker/api/types"
	log "github.com/sirupsen/logrus"
)

// TransformJenkins converts a Docktor V1 Jenkins into Docktor V2 service
func TransformJenkins(config types.ContainerJSON, jenkins Service) GroupService {

	service := GroupService{
		Name: "Jenkins",
	}

	image, _ := regexp.Compile(`[^:]+:([^-]+)(-[.*]+)?`)
	version := image.FindStringSubmatch(config.Config.Image)[1]

	for _, sub := range jenkins.SubServices {
		if strings.Contains(sub.File, version) {
			log.Infof("Transforming Jenkins service %s version %s ...", config.Name, version)
		}
	}

	return service
}
