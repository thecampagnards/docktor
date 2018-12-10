package utils

import (
	"docktor/server/types"

	"github.com/google/cadvisor/client"
	"github.com/google/cadvisor/info/v1"
)

// CAdvisorContainerInfo
func CAdvisorContainerInfo(daemon types.Daemon) (*v1.ContainerInfo, error) {
	cli, err := client.NewClient(daemon.CAdvisor)
	if err != nil {

		return nil, err
	}
	return cli.ContainerInfo("", nil)
}

// CAdvisorMachineInfo
func CAdvisorMachineInfo(daemon types.Daemon) (*v1.MachineInfo, error) {
	cli, err := client.NewClient(daemon.CAdvisor)
	if err != nil {

		return nil, err
	}
	return cli.MachineInfo()
}
