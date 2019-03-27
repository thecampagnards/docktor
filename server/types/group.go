package types

import (
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
	FixPort      bool
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

	if u.IsAdmin() {
		return true
	}

	for _, user := range g.Users {
		if user == u.Username {
			return true
		}
	}
	return false
}
