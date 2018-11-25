package utils

import (
	"docktor/server/types"
	"io"
	"net/http"
	"os"
	"strings"

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

		options := tlsconfig.Options{
			CAFile:             ca,
			CertFile:           cert,
			KeyFile:            key,
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
func GetContainers(daemon types.Daemon, groups ...types.Group) (types.Containers, error) {
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

		for _, n := range dockerContainer.Names {
			for _, ng := range groups {
				// Check if the container start with the group name
				if strings.HasPrefix(strings.ToLower(n), strings.ToLower(ng.Name)) {

				}
			}
		}

		container.Container = dockerContainer
		containers = append(containers, container)

	}

	return containers, nil
}

// GetContainerLog
func GetContainerLog(daemon types.Daemon, containerID string) (io.ReadCloser, error) {
	cli, err := GetDockerCli(daemon)
	if err != nil {
		return nil, err
	}

	return cli.ContainerLogs(context.Background(), containerID, dockerTypes.ContainerLogsOptions{ShowStdout: true, ShowStderr: true, Follow: true})
}
