package utils

import (
	"net/http"
	"web-docker-manager/server/types"

	dockerTypes "github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/tlsconfig"
	"golang.org/x/net/context"
)

// GetDockerCli
func GetDockerCli(daemon types.Daemon) (*client.Client, error) {

	c := &http.Client{
		Transport:     &http.Transport{},
		CheckRedirect: client.CheckRedirect,
	}

	if daemon.Cert != (types.Cert{}) {
		options := tlsconfig.Options{
			CAFile:             daemon.Ca,
			CertFile:           daemon.Cert.Cert,
			KeyFile:            daemon.Key,
			InsecureSkipVerify: true,
		}

		tlsc, err := tlsconfig.Client(options)
		if err != nil {
			return nil, err
		}

		c = &http.Client{
			Transport:     &http.Transport{TLSClientConfig: tlsc},
			CheckRedirect: client.CheckRedirect,
		}
	}

	return client.NewClientWithOpts(client.WithHost(daemon.GetCompleteHost()), client.WithHTTPClient(c))
}

// GetContainers
func GetContainers(daemon types.Daemon) (types.Containers, error) {
	var containers types.Containers

	cli, err := GetDockerCli(daemon)

	if err != nil {
		return containers, err
	}

	dockerContainers, err := cli.ContainerList(context.Background(), dockerTypes.ContainerListOptions{All: true})
	if err != nil {
		return containers, err
	}

	var container types.Container
	for _, dockerContainer := range dockerContainers {
		container.Container = dockerContainer
		containers = append(containers, container)
	}

	return containers, nil
}
