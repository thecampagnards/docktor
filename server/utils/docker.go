package utils

import (
	"docktor/server/types"
	"errors"
	"io"
	"net/http"
	"os"
	"time"

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
func GetContainers(daemon types.Daemon) ([]dockerTypes.Container, error) {
	cli, err := GetDockerCli(daemon)

	if err != nil {
		return nil, err
	}

	return cli.ContainerList(context.Background(), dockerTypes.ContainerListOptions{All: true})
}

// InspectContainers
func InspectContainers(daemon types.Daemon, containersName ...string) ([]dockerTypes.ContainerJSON, error) {

	cli, err := GetDockerCli(daemon)

	if err != nil {
		return nil, err
	}

	var containers []dockerTypes.ContainerJSON
	for _, c := range containersName {
		container, err := cli.ContainerInspect(context.Background(), c)
		if err != nil {
			return nil, err
		}

		containers = append(containers, container)
	}

	return containers, nil
}

// StartContainers
func StartContainers(daemon types.Daemon, containersName ...string) error {

	cli, err := GetDockerCli(daemon)

	if err != nil {
		return err
	}

	for _, c := range containersName {
		err = cli.ContainerStart(context.Background(), c, dockerTypes.ContainerStartOptions{})
		if err != nil {
			return err
		}
	}

	return nil
}

// StopContainers
func StopContainers(daemon types.Daemon, containersName ...string) error {

	cli, err := GetDockerCli(daemon)

	if err != nil {
		return err
	}

	var timeout = (10) * time.Second

	for _, c := range containersName {
		err = cli.ContainerStop(context.Background(), c, &timeout)
		if err != nil {
			return err
		}
	}

	return nil
}

// RemoveContainers
func RemoveContainers(daemon types.Daemon, containersName ...string) error {

	cli, err := GetDockerCli(daemon)

	if err != nil {
		return err
	}

	for _, c := range containersName {
		err = cli.ContainerRemove(context.Background(), c, dockerTypes.ContainerRemoveOptions{Force: true})
		if err != nil {
			return err
		}
	}

	return nil
}

// LogContainer
func LogContainer(daemon types.Daemon, containerName string) (io.ReadCloser, error) {

	cli, err := GetDockerCli(daemon)

	if err != nil {
		return nil, err
	}

	return cli.ContainerLogs(context.Background(), containerName, dockerTypes.ContainerLogsOptions{})
}

// GetContainerLog
func GetContainerLog(daemon types.Daemon, containerID string) (io.ReadCloser, error) {
	cli, err := GetDockerCli(daemon)
	if err != nil {
		return nil, err
	}

	return cli.ContainerLogs(context.Background(), containerID, dockerTypes.ContainerLogsOptions{ShowStdout: true, ShowStderr: true, Follow: true})
}

// RunContainerCommands
// Based on https://github.com/bitbull-team/docker-exec-web-console
func RunContainerCommands(daemon types.Daemon, containerID string) (dockerTypes.HijackedResponse, error) {

	cli, err := GetDockerCli(daemon)
	if err != nil {
		return dockerTypes.HijackedResponse{}, err
	}

	exec, err := cli.ContainerExecCreate(context.Background(), containerID, dockerTypes.ExecConfig{
		AttachStdin:  true,
		AttachStdout: true,
		AttachStderr: true,
		Tty:          true,
		Cmd:          []string{"/bin/sh"},
	})
	if err != nil {
		return dockerTypes.HijackedResponse{}, err
	}

	execID := exec.ID
	if execID == "" {
		return dockerTypes.HijackedResponse{}, errors.New("exec ID empty")
	}

	cli, err = GetDockerCli(daemon)
	if err != nil {
		return dockerTypes.HijackedResponse{}, err
	}

	return cli.ContainerExecAttach(context.Background(), exec.ID, dockerTypes.ExecStartCheck{Detach: false, Tty: true})
}
