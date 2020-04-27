package types

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/tlsconfig"
	"golang.org/x/net/context"
)

// DockerCli
type DockerCli struct {
	*client.Client
	ca   string
	cert string
	key  string
}

// Close
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
		}
	}

	cli.Client, err = client.NewClientWithOpts(client.WithHost(d.GetCompleteHost()), client.WithHTTPClient(c), client.WithAPIVersionNegotiation())
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
				{
					Subnet:  subnet,
					Gateway: gateway,
				},
			},
		}
	}

	resp, err := cli.NetworkCreate(context.Background(), networkName, net)
	if err != nil && !(strings.Contains(err.Error(), fmt.Sprintf("network with name %s already exists", networkName)) ||
		strings.Contains(err.Error(), "is a pre-defined network and cannot be created")) {
		return types.NetworkCreateResponse{}, err
	}
	return resp, nil
}

// CreateContainer set follow to true to follow the container
func (d *Daemon) CreateContainer(ctn types.ContainerJSON, follow bool) (err error) {

	ctx := context.Background()
	cli, err := d.getDockerCli()
	if err != nil {
		return
	}

	defer cli.Close()

	// Check if container doesn't exist if not create it
	_, err = d.InspectContainers(ctn.Name)
	if err != nil {
		// Creating the networks
		for key, net := range ctn.NetworkSettings.Networks {
			ip := strings.Split(".", net.IPAddress)
			ip = ip[:len(ip)-1]
			ip = append(ip, "0")
			_, err = d.CreateNetwork(key, fmt.Sprintf("%s/%v", strings.Join(ip, "."), net.IPPrefixLen))
			if err != nil {
				return
			}
		}

		// Pulling the image
		_, err = cli.ImagePull(ctx, ctn.Config.Image, types.ImagePullOptions{})
		if err != nil {
			return
		}

		// Creating the container
		_, err = cli.ContainerCreate(
			ctx,
			ctn.Config,
			ctn.HostConfig,
			&network.NetworkingConfig{
				EndpointsConfig: ctn.NetworkSettings.Networks,
			},
			ctn.Name,
		)
		if err != nil {
			return err
		}
	}

	err = cli.ContainerStart(ctx, ctn.Name, types.ContainerStartOptions{})
	if err != nil {
		return err
	}

	if follow {
		statusCh, errCh := cli.ContainerWait(ctx, ctn.Name, container.WaitConditionNotRunning)
		select {
		case err = <-errCh:
			if err != nil {
				return err
			}
		case status := <-statusCh:
			if status.StatusCode > 0 {
				return fmt.Errorf("Exit status: %v", status.StatusCode)
			}
		}
	}

	return
}

// CmdContainer executes a command from an Alpine container with mapped volume
func (d *Daemon) CmdContainer(sourceVolume string, cmd []string) (err error) {
	return d.CreateContainer(types.ContainerJSON{
		ContainerJSONBase: &types.ContainerJSONBase{
			Name: randString(32),
			HostConfig: &container.HostConfig{
				AutoRemove: true,
				Mounts: []mount.Mount{
					{
						Type:   mount.TypeBind,
						Source: sourceVolume,
						Target: "/data",
					},
				},
			},
		},
		Config: &container.Config{
			Image: "alpine",
			Cmd:   cmd,
		},
		NetworkSettings: &types.NetworkSettings{
			Networks: map[string]*network.EndpointSettings{},
		},
	}, true)
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
			if strings.HasPrefix(NormalizeName(n), NormalizeName(name)) {
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
func (d *Daemon) StartContainers(containersName ...string) (errs map[string]string) {
	errs = make(map[string]string)

	cli, err := d.getDockerCli()
	if err != nil {
		return
	}

	defer cli.Close()

	for _, c := range containersName {
		err = cli.ContainerStart(context.Background(), c, types.ContainerStartOptions{})
		if err != nil {
			errs[c] = err.Error()
		}
	}

	return
}

// StopContainers
func (d *Daemon) StopContainers(containersName ...string) (errs map[string]string) {
	errs = make(map[string]string)

	cli, err := d.getDockerCli()
	if err != nil {
		return
	}

	defer cli.Close()

	var timeout = DOCKER_STOP_TIMEOUT
	for _, c := range containersName {
		err = cli.ContainerStop(context.Background(), c, &timeout)
		if err != nil {
			errs[c] = err.Error()
		}
	}

	return
}

// RemoveContainers
func (d *Daemon) RemoveContainers(containersName ...string) (errs map[string]string) {
	errs = make(map[string]string)

	cli, err := d.getDockerCli()
	if err != nil {
		return
	}

	defer cli.Close()

	for _, c := range containersName {
		err = cli.ContainerRemove(context.Background(), c, types.ContainerRemoveOptions{Force: true})
		if err != nil {
			errs[c] = err.Error()
		}
	}

	return
}

// RestartContainers
func (d *Daemon) RestartContainers(containersName ...string) (errs map[string]string) {
	errs = make(map[string]string)

	cli, err := d.getDockerCli()
	if err != nil {
		return
	}

	defer cli.Close()

	var timeout = DOCKER_STOP_TIMEOUT
	for _, c := range containersName {
		err = cli.ContainerRestart(context.Background(), c, &timeout)
		if err != nil {
			errs[c] = err.Error()
		}
	}

	return
}

// ExecContainer run commands on container
func (d *Daemon) ExecContainer(containerName string, commands []string) ([]byte, error) {

	cli, err := d.getDockerCli()
	if err != nil {
		return nil, err
	}

	defer cli.Close()

	exec, err := cli.ContainerExecCreate(context.Background(), containerName, types.ExecConfig{
		AttachStdin:  true,
		AttachStdout: true,
		AttachStderr: true,
		Tty:          false,
		Cmd:          []string{"/bin/sh"},
		Detach:       false,
	})

	if err != nil {
		return nil, err
	}

	if exec.ID == "" {
		return nil, errors.New("exec ID empty")
	}

	res, err := cli.ContainerExecAttach(context.Background(), exec.ID, types.ExecStartCheck{Detach: false, Tty: true})
	if err != nil {
		return nil, err
	}
	defer res.Close()

	for _, command := range commands {
		io.WriteString(res.Conn, command+"\n")
	}
	io.WriteString(res.Conn, "exit\n")

	return ioutil.ReadAll(res.Reader)
}

// GetContainerLogFollow
func (d *Daemon) GetContainerLogFollow(containerName string) (io.ReadCloser, error) {

	cli, err := d.getDockerCli()
	if err != nil {
		return nil, err
	}

	defer cli.Close()

	return cli.ContainerLogs(context.Background(), containerName, types.ContainerLogsOptions{Timestamps: false, Tail: "40", ShowStdout: true, ShowStderr: true, Follow: true})
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

// NormalizeName escape everithing useless from the container name
func NormalizeName(name string) string {
	r := regexp.MustCompile("[^a-z0-9]+")
	return r.ReplaceAllString(strings.ToLower(name), "")
}

// GetDockerImages
func (d *Daemon) GetDockerImages() ([]types.ImageSummary, error) {

	cli, err := d.getDockerCli()
	if err != nil {
		return []types.ImageSummary{}, err
	}

	defer cli.Close()

	return cli.ImageList(context.Background(), types.ImageListOptions{All: true})
}

// RemoveDockerImages
func (d *Daemon) RemoveDockerImages(image string) ([]types.ImageDeleteResponseItem, error) {

	cli, err := d.getDockerCli()
	if err != nil {
		return []types.ImageDeleteResponseItem{}, err
	}

	defer cli.Close()

	return cli.ImageRemove(context.Background(), image, types.ImageRemoveOptions{Force: true})
}
