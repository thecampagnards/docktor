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
			if strings.Contains(v, sub.Variables[i].Name) {
				value := strings.Split(v, "=")[1]
				log.Infof("Variable %s = %s", sub.Variables[i].Name, value)
				sub.Variables[i].Value = value
			}
		}
	}
}

// TransformJenkins converts a Docktor V1 Jenkins into Docktor V2 service
func TransformJenkins(config types.ContainerJSON, jenkins Service) SubService {

	image, _ := regexp.Compile(`[^:]+:([^-]+)(-[.*]+)?`)
	version := image.FindStringSubmatch(config.Config.Image)[1]

	for _, sub := range jenkins.SubServices {
		if strings.Contains(sub.File, version) {
			log.Infof("Transforming Jenkins service %s version %s ...", config.Name, version)

			// Get template
			sub.GetVariables()
			// Set variable values
			importVariables(&sub, config.Config.Env)

			return sub
		}
	}

	return SubService{}
}
