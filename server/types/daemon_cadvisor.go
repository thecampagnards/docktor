package types

import (
	"github.com/google/cadvisor/client"
	v1 "github.com/google/cadvisor/info/v1"
)

// CAdvisorContainerInfo
func (d *Daemon) CAdvisorContainerInfo() (*v1.ContainerInfo, error) {
	cli, err := client.NewClient(d.CAdvisor)
	if err != nil {
		return nil, err
	}
	return cli.ContainerInfo("", nil)
}

// CAdvisorMachineInfo
func (d *Daemon) CAdvisorMachineInfo() (*v1.MachineInfo, error) {
	cli, err := client.NewClient(d.CAdvisor)
	if err != nil {

		return nil, err
	}
	return cli.MachineInfo()
}
