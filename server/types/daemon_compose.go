package types

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/docker/go-connections/tlsconfig"
	"github.com/docker/libcompose/docker"
	"github.com/docker/libcompose/docker/client"
	"github.com/docker/libcompose/docker/ctx"
	"github.com/docker/libcompose/project"
	"github.com/docker/libcompose/project/options"
	"golang.org/x/net/context"
)

// ComposeCli
type ComposeCli struct {
	client.Factory
	ca   string
	cert string
	key  string
}

// Close
func (cli *ComposeCli) Close() {
	os.Remove(cli.ca)
	os.Remove(cli.cert)
	os.Remove(cli.key)
}

func (d *Daemon) getComposeCli() (cli ComposeCli, err error) {

	c := client.Options{
		Host: d.GetCompleteHost(),
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

		c = client.Options{
			TLS:  true,
			Host: d.GetCompleteHost(),
			TLSOptions: tlsconfig.Options{
				CAFile:             cli.ca,
				CertFile:           cli.cert,
				KeyFile:            cli.key,
				InsecureSkipVerify: true,
			},
		}

	}

	cli.Factory, err = client.NewDefaultFactory(c)
	return
}

// if files is a []string this has to be the compose file path array
func getComposeProjectContext(projectName string, files interface{}) (con project.Context, err error) {
	con.ProjectName = projectName

	switch files.(type) {
	case []string:
		con.ComposeFiles = files.([]string)
	case [][]byte:
		con.ComposeBytes = files.([][]byte)
	default:
		err = errors.New("Invalide type for file")
	}

	return
}

// ComposeUp run service, files has to be []string or [][]byte
func (d *Daemon) ComposeUp(projectName string, serviceName string, subnet string, files interface{}) (err error) {

	if subnet != "" {
		_, err = d.CreateNetwork(fmt.Sprintf("%s-net", projectName), subnet)
		if err != nil {
			return
		}
	}

	contextName := fmt.Sprintf("%s_%s", projectName, serviceName)

	con, err := getComposeProjectContext(contextName, files)
	if err != nil {
		return
	}

	c, err := d.getComposeCli()
	if err != nil {
		return
	}

	defer c.Close()

	project, err := docker.NewProject(&ctx.Context{
		Context:       con,
		ClientFactory: c,
	}, nil)

	if err != nil {
		return
	}

	err = project.Up(context.Background(), options.Up{})
	if err != nil && strings.Contains(err.Error(), "already exists") {
		return nil
	}

	return
}

// ComposeStop stop service, files has to be []string or [][]byte
func (d *Daemon) ComposeStop(contextName string, files interface{}) (err error) {

	con, err := getComposeProjectContext(contextName, files)
	if err != nil {
		return
	}

	c, err := d.getComposeCli()
	if err != nil {
		return
	}

	defer c.Close()

	project, err := docker.NewProject(&ctx.Context{
		Context:       con,
		ClientFactory: c,
	}, nil)

	if err != nil {
		return
	}

	return project.Stop(context.Background(), 10)
}

// ComposeRemove remove service, files has to be []string or [][]byte
func (d *Daemon) ComposeRemove(contextName string, files interface{}) (err error) {

	con, err := getComposeProjectContext(contextName, files)
	if err != nil {
		return
	}

	c, err := d.getComposeCli()
	if err != nil {
		return
	}

	defer c.Close()

	project, err := docker.NewProject(&ctx.Context{
		Context:       con,
		ClientFactory: c,
	}, nil)

	if err != nil {
		return
	}

	return project.Delete(context.Background(), options.Delete{RemoveVolume: true, RemoveRunning: true})
}

// ComposeStatus get status of service, files has to be []string or [][]byte
func (d *Daemon) ComposeStatus(contextName string, files interface{}) (info project.InfoSet, err error) {

	con, err := getComposeProjectContext(contextName, files)
	if err != nil {
		return
	}

	c, err := d.getComposeCli()
	if err != nil {
		return
	}

	defer c.Close()

	project, err := docker.NewProject(&ctx.Context{
		Context:       con,
		ClientFactory: c,
	}, nil)

	if err != nil {
		return
	}

	return project.Ps(context.Background())
}
