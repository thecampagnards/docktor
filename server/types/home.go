package types

import (
	"github.com/docker/docker/api/types"
	info "github.com/google/cadvisor/info/v1"
)

// HomePage data
type HomePage struct {
	User         UserLight     `json:"user"`
	Environments []Environment `json:"environments"`
}

// Environment contains useful data for a group preview
type Environment struct {
	Group      GroupLight          `json:"group"`
	Daemon     DaemonLight         `json:"daemon"`
	Machine    *info.MachineInfo   `json:"machine"`
	Resources  *info.ContainerInfo `json:"resources"`
	Containers []types.Container   `json:"containers"`
}
