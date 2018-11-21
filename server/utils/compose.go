package utils

import (
	"docktor/server/types"
	"os"

	"golang.org/x/net/context"

	"github.com/docker/go-connections/tlsconfig"
	"github.com/docker/libcompose/docker"
	"github.com/docker/libcompose/docker/client"
	"github.com/docker/libcompose/docker/ctx"
	"github.com/docker/libcompose/project"
	"github.com/docker/libcompose/project/options"
)

// GetComposeCli
func GetComposeCli(daemon types.Daemon) (client.Factory, error) {

	c := client.Options{
		Host: daemon.GetCompleteHost(),
	}

	if daemon.Cert != (types.Cert{}) {

		ca, err := WriteStringToFile(daemon.Ca)
		if err != nil {
			return nil, err
		}
		defer os.Remove(ca)

		cert, err := WriteStringToFile(daemon.Cert.Cert)
		if err != nil {
			return nil, err
		}
		defer os.Remove(cert)

		key, err := WriteStringToFile(daemon.Key)
		if err != nil {
			return nil, err
		}
		defer os.Remove(key)

		c = client.Options{
			TLS:       true,
			TLSVerify: true,
			Host:      daemon.GetCompleteHost(),
			TLSOptions: tlsconfig.Options{
				CAFile:             ca,
				CertFile:           cert,
				KeyFile:            key,
				InsecureSkipVerify: true,
			},
		}

	}

	return client.NewDefaultFactory(c)
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

// ComposeStatus
func ComposeStatus(group types.Group, daemon types.Daemon, files ...[]byte) error {

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

	return project.Ps(context.Background(), options.Up{})
}
