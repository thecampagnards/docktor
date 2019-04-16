package types

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/docker/docker/api/types"
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

func (d *Daemon) getDockerCli() (cli DockerCli, err error) {

	c := &http.Client{
		Transport:     &http.Transport{},
		CheckRedirect: client.CheckRedirect,
		Timeout:       time.Second * 5,
	}

	if d.Docker.Certs != (Certs{}) {

		cli.ca, err = WriteStringToFile(d.Docker.Ca)
		if err != nil {
			return
		}

		cli.cert, err = WriteStringToFile(d.Docker.Cert)
		if err != nil {
			return
		}

		cli.key, err = WriteStringToFile(d.Docker.Key)
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
			Timeout:       time.Second * 5,
		}
	}

	cli.Client, err = client.NewClientWithOpts(client.WithHost(d.GetCompleteHost()), client.WithHTTPClient(c))
	return
}

// CreateNetwork
func (d *Daemon) CreateNetwork(networkName string, subnet string) (types.NetworkCreateResponse, error) {

	cli, err := d.getDockerCli()
	if err != nil {
		return types.NetworkCreateResponse{}, err
	}

	defer cli.Close()

	net := types.NetworkCreate{
		CheckDuplicate: true,
	}

	if subnet != "" {
		ip := strings.Split(subnet, ".")
		ip = ip[:len(ip)-1]
		ip = append(ip, "1")
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
		return types.NetworkCreateResponse{}, err
	}
	return resp, nil
}

// CreateContainer
func (d *Daemon) CreateContainer(container types.ContainerJSON) (err error) {

	ctx := context.Background()
	cli, err := d.getDockerCli()
	if err != nil {
		return
	}

	defer cli.Close()

	// Pulling the image
	_, err = cli.ImagePull(ctx, container.Config.Image, types.ImagePullOptions{})
	if err != nil {
		return
	}

	// Creating the networks
	for key, net := range container.NetworkSettings.Networks {
		ip := strings.Split(".", net.IPAddress)
		ip = ip[:len(ip)-1]
		ip = append(ip, "0")
		_, err = d.CreateNetwork(key, fmt.Sprintf("%s/%v", strings.Join(ip, "."), net.IPPrefixLen))
		if err != nil {
			return
		}
	}

	// Creating the container
	resp, err := cli.ContainerCreate(
		ctx,
		container.Config,
		container.HostConfig,
		&network.NetworkingConfig{
			EndpointsConfig: container.NetworkSettings.Networks,
		},
		container.Name,
	)
	if err != nil {
		return
	}

	return cli.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{})
}

// GetContainers
func (d *Daemon) GetContainers() ([]types.Container, error) {

	cli, err := d.getDockerCli()
	if err != nil {
		return nil, err
	}

	defer cli.Close()

	return cli.ContainerList(context.Background(), types.ContainerListOptions{All: true})
}

// GetContainersStartByName
func (d *Daemon) GetContainersStartByName(name string) (containers []types.Container, err error) {

	cs, err := d.GetContainers()
	if err != nil {
		return
	}

	for _, c := range cs {
		for _, n := range c.Names {
			if strings.HasPrefix(normalizeName(n), normalizeName(name)) {
				containers = append(containers, c)
				break
			}
		}
	}

	return
}

// GetDockerInfo
func (d *Daemon) GetDockerInfo() (types.Info, error) {

	cli, err := d.getDockerCli()
	if err != nil {
		return types.Info{}, err
	}

	defer cli.Close()

	return cli.Info(context.Background())
}

// InspectContainers
func (d *Daemon) InspectContainers(containersName ...string) ([]types.ContainerJSON, error) {

	cli, err := d.getDockerCli()
	if err != nil {
		return nil, err
	}

	defer cli.Close()

	var containers []types.ContainerJSON
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
func (d *Daemon) StartContainers(containersName ...string) (err error) {

	cli, err := d.getDockerCli()
	if err != nil {
		return
	}

	defer cli.Close()

	for _, c := range containersName {
		err = cli.ContainerStart(context.Background(), c, types.ContainerStartOptions{})
		if err != nil {
			return
		}
	}

	return
}

// StopContainers
func (d *Daemon) StopContainers(containersName ...string) (err error) {

	cli, err := d.getDockerCli()
	if err != nil {
		return
	}

	defer cli.Close()

	var timeout = DOCKER_STOP_TIMEOUT
	for _, c := range containersName {
		err = cli.ContainerStop(context.Background(), c, &timeout)
		if err != nil {
			return
		}
	}

	return
}

// RemoveContainers
func (d *Daemon) RemoveContainers(containersName ...string) (err error) {

	cli, err := d.getDockerCli()
	if err != nil {
		return
	}

	defer cli.Close()

	for _, c := range containersName {
		err = cli.ContainerRemove(context.Background(), c, types.ContainerRemoveOptions{Force: true})
		if err != nil {
			return
		}
	}

	return
}

// GetContainerLog
func (d *Daemon) GetContainerLog(containerName string) (io.ReadCloser, error) {

	cli, err := d.getDockerCli()
	if err != nil {
		return nil, err
	}

	defer cli.Close()

	return cli.ContainerLogs(context.Background(), containerName, types.ContainerLogsOptions{})
}

// GetContainerLogFollow
func (d *Daemon) GetContainerLogFollow(containerName string) (io.ReadCloser, error) {

	cli, err := d.getDockerCli()
	if err != nil {
		return nil, err
	}

	return cli.ContainerLogs(context.Background(), containerName, types.ContainerLogsOptions{Since: DOCKER_LOG_SINCE, ShowStdout: true, ShowStderr: true, Follow: true})
}

// GetContainerTerm
func (d *Daemon) GetContainerTerm(containerName string) (types.HijackedResponse, error) {

	cli, err := d.getDockerCli()
	if err != nil {
		return types.HijackedResponse{}, err
	}

	exec, err := cli.ContainerExecCreate(context.Background(), containerName, types.ExecConfig{
		AttachStdin:  true,
		AttachStdout: true,
		AttachStderr: true,
		Tty:          true,
		Cmd:          []string{"/bin/sh"},
	})
	if err != nil {
		return types.HijackedResponse{}, err
	}

	if exec.ID == "" {
		return types.HijackedResponse{}, errors.New("exec ID empty")
	}

	cli.Close()

	cli, err = d.getDockerCli()
	if err != nil {
		return types.HijackedResponse{}, err
	}
	defer cli.Close()

	return cli.ContainerExecAttach(context.Background(), exec.ID, types.ExecStartCheck{Detach: false, Tty: true})
}

func normalizeName(name string) string {
	r := regexp.MustCompile("[^a-z0-9]+")
	return r.ReplaceAllString(strings.ToLower(name), "")
}
