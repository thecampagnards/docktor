package types

import "github.com/globalsign/mgo/bson"

const (
	FORM_DATA_FILES_FIELD_NAME = "files"
	FORM_DATA_DATA_FIELD_NAME  = "data"
)

type Group struct {
	ID bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`

	Name        string
	Description string
	DaemonID    bson.ObjectId
	Services    []ServiceGroup
}

type ServiceGroup struct {
	ServiceID bson.ObjectId
	Files     [][]byte
}

type Groups []Group

//https://hackernoon.com/make-yourself-a-go-web-server-with-mongodb-go-on-go-on-go-on-48f394f24e
