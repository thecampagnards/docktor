package types

import (
	"github.com/docker/docker/api/types"
	"github.com/globalsign/mgo/bson"
)

// GroupLight data
type GroupLight struct {
	ID          bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string        `json:"name" bson:"name" validate:"required"`
	Description string        `json:"description" bson:"description"`
	Daemon      bson.ObjectId `json:"daemon_id,omitempty" bson:"daemon_id,omitempty"`
	Admins      []string      `json:"admins" bson:"admins"`
	Users       []string      `json:"users" bson:"users"`
}

// Group data
type Group struct {
	GroupLight  `bson:",inline"`
	Services    []ServiceGroup `json:"services" bson:"services"`
	GroupDocker `bson:",inline"`
}

// GroupDocker data
type GroupDocker struct {
	Subnet     string                `json:"subnet" bson:"subnet"`
	MinPort    uint16                `json:"min_port" bson:"min_port"`
	MaxPort    uint16                `json:"max_port" bson:"max_port"`
	Containers []types.ContainerJSON `json:"containers" bson:"containers"`
}

// ServiceGroup data
type ServiceGroup struct {
	SubServiceID bson.ObjectId          `json:"_id,omitempty" bson:"_id,omitempty"`
	Variables    map[string]interface{} `json:"variables,omitempty" bson:"variables"`
	AutoUpdate   bool                   `json:"auto_update" bson:"auto_update"`
	Ports        []uint16               `json:"ports" bson:"ports"`
}

// Groups data
type Groups []Group

// GroupsLight data
type GroupsLight []GroupLight

// IsAdmin check if a user is admin in this group
func (g *Group) IsAdmin(u *User) bool {

	if u.IsAdmin() {
		return true
	}

	for _, admin := range g.Admins {
		if admin == u.Username {
			return true
		}
	}
	return false
}

// IsMyGroup check if this is a group of the user
func (g *Group) IsMyGroup(u *User) bool {

	if g.IsAdmin(u) {
		return true
	}

	for _, user := range g.Users {
		if user == u.Username {
			return true
		}
	}
	return false
}

// GetFreePort return the first available port
func (g *Group) GetFreePort() uint16 {
	var ports []uint16
	for _, s := range g.Services {
		ports = append(ports, s.Ports...)
	}

	for i := g.MinPort; i < g.MaxPort; i++ {
		if !findPort(i, ports) {
			return i
		}
	}

	return 0
}

func findPort(port uint16, ports []uint16) bool {
	for _, p := range ports {
		if port == p {
			return true
		}
	}
	return false
}
