package utils

import (
	"web-docker-manager/server/types"

	"golang.org/x/net/context"

	"github.com/docker/go-connections/tlsconfig"
	"github.com/docker/libcompose/config"
	"github.com/docker/libcompose/docker"
	"github.com/docker/libcompose/docker/client"
	"github.com/docker/libcompose/docker/ctx"
	"github.com/docker/libcompose/project"
	"github.com/docker/libcompose/project/options"

	"gopkg.in/yaml.v2"
)

// GetComposeCli
func GetComposeCli(daemon types.Daemon) (client.Factory, error) {

	c := client.Options{
		Host: daemon.GetCompleteHost(),
	}

	if daemon.Cert != (types.Cert{}) {
		c = client.Options{
			TLS:       true,
			TLSVerify: true,
			Host:      daemon.GetCompleteHost(),
			TLSOptions: tlsconfig.Options{
				CAFile:             daemon.Ca,
				CertFile:           daemon.Cert.Cert,
				KeyFile:            daemon.Key,
				InsecureSkipVerify: true,
			},
		}
	}

	return client.NewDefaultFactory(c)
}

// EditService
func EditService(file []byte, service string, field string, value interface{}) ([]byte, error) {

	// convert byte to interface
	var c config.Config
	err := yaml.Unmarshal(file, &c)
	if err != nil {
		return file, err
	}

	// Check type
	switch c.Services[service][field].(type) {
	case []interface{}:
		c.Services[service][field] = append(c.Services[service][field].([]interface{}), value)
	default:
		c.Services[service][field] = value
	}

	return yaml.Marshal(&c)
}

// ComposeUp
func ComposeUp(group types.Group, daemon types.Daemon, files ...[]byte) error {

	c, err := GetComposeCli(daemon)
	if err != nil {
		return err
	}

	project, err := docker.NewProject(&ctx.Context{
		Context: project.Context{
			ComposeBytes: files,
			ProjectName:  group.Name,
		},
		ClientFactory: c,
	}, nil)

	if err != nil {
		return err
	}

	return project.Up(context.Background(), options.Up{})
}
