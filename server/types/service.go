package types

import "github.com/globalsign/mgo/bson"

type Service struct {
	ID   bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name string
}

type ServiceFile struct {
	File      []byte
	Active    bool
	Variables map[string]string
}
