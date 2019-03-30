package utils

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"docktor/server/types"

	dockerTypes "github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/tlsconfig"
	"golang.org/x/net/context"
)

type DockerCli struct {
	*client.Client
	ca   string
	cert string
	key  string
}

func (cli *DockerCli) Close() {
	os.Remove(cli.ca)
	os.Remove(cli.cert)
	os.Remove(cli.key)
	cli.Client.Close()
}

func getDockerCli(daemon types.Daemon) (cli DockerCli, err error) {

	c := &http.Client{
		Transport:     &http.Transport{},
		CheckRedirect: client.CheckRedirect,
	}

	if daemon.Docker.Cert != (types.Cert{}) {

		cli.ca, err = WriteStringToFile(daemon.Docker.Ca)
		if err != nil {
			return
		}

		cli.cert, err = WriteStringToFile(daemon.Docker.Cert.Cert)
		if err != nil {
			return
		}

		cli.key, err = WriteStringToFile(daemon.Docker.Key)
		if err != nil {
			return
		}

		options := tlsconfig.Options{
			CAFile:             cli.ca,
			CertFile:           cli.cert,
			KeyFile:            cli.key,
			InsecureSkipVerify: true,
		}

		tlsc, err := tlsconfig.Client(options)
		if err != nil {
			return DockerCli{}, err
		}

		c = &http.Client{
			Transport:     &http.Transport{TLSClientConfig: tlsc},
			CheckRedirect: client.CheckRedirect,
		}
	}

	cli.Client, err = client.NewClientWithOpts(client.WithHost(daemon.GetCompleteHost()), client.WithHTTPClient(c))
	return
}

// CreateNetwork
func CreateNetwork(daemon types.Daemon, networkName string, subnet string) (dockerTypes.NetworkCreateResponse, error) {

	cli, err := getDockerCli(daemon)
	if err != nil {
		return dockerTypes.NetworkCreateResponse{}, err
	}

	defer cli.Close()

	net := dockerTypes.NetworkCreate{
		CheckDuplicate: true,
	}

	if subnet != "" {
		ip := strings.Split(subnet, ".")
		ip = ip[:len(ip)-1]
		ip[len(ip)] = "1"
		gateway := strings.Join(ip, ".")
		net.IPAM = &network.IPAM{
			Config: []network.IPAMConfig{
				network.IPAMConfig{
					Subnet:  subnet,
					Gateway: gateway,
				},
			},
		}
	}

	resp, err := cli.NetworkCreate(context.Background(), networkName, net)
	if err != nil && !strings.Contains(err.Error(), fmt.Sprintf("network with name %s already exists", networkName)) {
		return dockerTypes.NetworkCreateResponse{}, err
	}
	return resp, nil
}

// GetContainers
func GetContainers(daemon types.Daemon) ([]dockerTypes.Container, error) {

	cli, err := getDockerCli(daemon)
	if err != nil {
		return nil, err
	}

	defer cli.Close()

	return cli.ContainerList(context.Background(), dockerTypes.ContainerListOptions{All: true})
}

// GetContainersStartByName
func GetContainersStartByName(daemon types.Daemon, name string) (containers []dockerTypes.Container, err error) {

	cs, err := GetContainers(daemon)
	if err != nil {
		return
	}

	for _, c := range cs {
		for _, n := range c.Names {
			if strings.HasPrefix(strings.ToLower(n), "/"+strings.ToLower(name)) {
				containers = append(containers, c)
				break
			}
		}
	}

	return
}

// InspectContainers
func InspectContainers(daemon types.Daemon, containersName ...string) ([]dockerTypes.ContainerJSON, error) {

	cli, err := getDockerCli(daemon)
	if err != nil {
		return nil, err
	}

	defer cli.Close()

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
func StartContainers(daemon types.Daemon, containersName ...string) (err error) {

	cli, err := getDockerCli(daemon)
	if err != nil {
		return
	}

	defer cli.Close()

	for _, c := range containersName {
		err = cli.ContainerStart(context.Background(), c, dockerTypes.ContainerStartOptions{})
		if err != nil {
			return
		}
	}

	return
}

// StopContainers
func StopContainers(daemon types.Daemon, containersName ...string) (err error) {

	cli, err := getDockerCli(daemon)
	if err != nil {
		return
	}

	defer cli.Close()

	var timeout = types.DOCKER_STOP_TIMEOUT
	for _, c := range containersName {
		err = cli.ContainerStop(context.Background(), c, &timeout)
		if err != nil {
			return
		}
	}

	return
}

// RemoveContainers
func RemoveContainers(daemon types.Daemon, containersName ...string) (err error) {

	cli, err := getDockerCli(daemon)
	if err != nil {
		return
	}

	defer cli.Close()

	for _, c := range containersName {
		err = cli.ContainerRemove(context.Background(), c, dockerTypes.ContainerRemoveOptions{Force: true})
		if err != nil {
			return
		}
	}

	return
}

// GetContainerLog
func GetContainerLog(daemon types.Daemon, containerName string) (io.ReadCloser, error) {

	cli, err := getDockerCli(daemon)
	if err != nil {
		return nil, err
	}

	defer cli.Close()

	return cli.ContainerLogs(context.Background(), containerName, dockerTypes.ContainerLogsOptions{})
}

// GetContainerLogFollow
func GetContainerLogFollow(daemon types.Daemon, containerName string) (io.ReadCloser, error) {

	cli, err := getDockerCli(daemon)
	if err != nil {
		return nil, err
	}

	return cli.ContainerLogs(context.Background(), containerName, dockerTypes.ContainerLogsOptions{Since: types.DOCKER_LOG_SINCE, ShowStdout: true, ShowStderr: true, Follow: true})
}

// GetContainerTerm
func GetContainerTerm(daemon types.Daemon, containerName string) (dockerTypes.HijackedResponse, error) {

	cli, err := getDockerCli(daemon)
	if err != nil {
		return dockerTypes.HijackedResponse{}, err
	}

	exec, err := cli.ContainerExecCreate(context.Background(), containerName, dockerTypes.ExecConfig{
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

	cli.Close()

	cli, err = getDockerCli(daemon)
	if err != nil {
		return dockerTypes.HijackedResponse{}, err
	}
	defer cli.Close()

	return cli.ContainerExecAttach(context.Background(), exec.ID, dockerTypes.ExecStartCheck{Detach: false, Tty: true})
}
