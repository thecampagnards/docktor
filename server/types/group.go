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
}

type ServiceGroup struct {
	ServiceID    bson.ObjectId
	SubServiceID bson.ObjectId
	Variables    interface{}
}

type Groups []Group
