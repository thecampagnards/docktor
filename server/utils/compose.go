package utils

import (
	"errors"
	"os"

	"docktor/server/types"

	"github.com/docker/go-connections/tlsconfig"
	"github.com/docker/libcompose/docker"
	"github.com/docker/libcompose/docker/client"
	"github.com/docker/libcompose/docker/ctx"
	"github.com/docker/libcompose/project"
	"github.com/docker/libcompose/project/options"
	"golang.org/x/net/context"
)

type ComposeCli struct {
	client.Factory
	ca   string
	cert string
	key  string
}

func (cli *ComposeCli) Close() {
	os.Remove(cli.ca)
	os.Remove(cli.cert)
	os.Remove(cli.key)
}

func getComposeCli(daemon types.Daemon) (cli ComposeCli, err error) {

	c := client.Options{
		Host: daemon.GetCompleteHost(),
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

		c = client.Options{
			TLS:  true,
			Host: daemon.GetCompleteHost(),
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
func ComposeUp(projectName string, daemon types.Daemon, files interface{}) (err error) {

	con, err := getComposeProjectContext(projectName, files)
	if err != nil {
		return
	}

	c, err := getComposeCli(daemon)
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

	return project.Up(context.Background(), options.Up{})
}

// ComposeStop stop service, files has to be []string or [][]byte
func ComposeStop(projectName string, daemon types.Daemon, files interface{}) (err error) {

	con, err := getComposeProjectContext(projectName, files)
	if err != nil {
		return
	}

	c, err := getComposeCli(daemon)
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
func ComposeRemove(projectName string, daemon types.Daemon, files interface{}) (err error) {

	con, err := getComposeProjectContext(projectName, files)
	if err != nil {
		return
	}

	c, err := getComposeCli(daemon)
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
