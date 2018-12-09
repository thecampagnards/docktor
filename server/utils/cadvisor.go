package utils

import (
	"docktor/server/types"

	"github.com/google/cadvisor/client"
	"github.com/google/cadvisor/info/v1"
)

// CAdvisorStaticInfo
func CAdvisorStaticInfo(daemon types.Daemon) (*v1.ContainerInfo, error) {
	cli, err := client.NewClient(daemon.CAdvisor)
	if err != nil {

		return nil, err
	}

	return cli.ContainerInfo("", nil)

	//return cli.MachineInfo()
}
