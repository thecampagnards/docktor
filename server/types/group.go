package types

import (
	dockerTypes "github.com/docker/docker/api/types"
	"github.com/globalsign/mgo/bson"
)

type Group struct {
	ID          bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string
	Description string
	DaemonID    bson.ObjectId
	Services    []ServiceGroup
	Admins      []string
	Users       []string
	Subnet      string
	MinPort     uint16
	MaxPort     uint16
	Containers  []dockerTypes.ContainerJSON
}

type GroupRest struct {
	Group      `json:",omitempty" bson:",inline,omitempty"`
	UsersData  *Users  `json:",omitempty" bson:",omitempty"`
	AdminsData *Users  `json:",omitempty" bson:",omitempty"`
	DaemonData *Daemon `json:",omitempty" bson:",omitempty"`
}

type ServiceGroup struct {
	SubServiceID bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Variables    map[string]interface{}
	AutoUpdate   bool
	Ports        []uint16
}

type Groups []Group
type GroupsRest []GroupRest

// IsAdmin check if a user is admin in this group
func (g Group) IsAdmin(u User) bool {

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
func (g Group) IsMyGroup(u User) bool {

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
func (g Group) GetFreePort() uint16 {
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
