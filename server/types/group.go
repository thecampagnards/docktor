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
}

type ServiceGroup struct {
	SubServiceID bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Variables    interface{}
	Containers   []string
}

type Groups []Group

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
