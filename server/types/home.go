package types

import (
	"github.com/docker/docker/api/types"
)

// HomePage data
type HomePage struct {
	User         UserLight     `json:"user"`
	Environments []Environment `json:"environments"`
}

// Environment contains useful data for a group preview
type Environment struct {
	Group      GroupLight        `json:"group"`
	Daemon     DaemonLight       `json:"daemon"`
	Resources  *MachineUsage     `json:"resources"`
	Containers []types.Container `json:"containers"`
}
