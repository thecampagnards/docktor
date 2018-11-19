package types

import "github.com/globalsign/mgo/bson"

const (
	FORM_DATA_IMAGES_FIELD_NAME = "images"
)

type Service struct {
	ID   bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name string
	// Base 64 encoded
	Image        []byte
	ServiceFiles []ServiceFile
}

type ServiceFile struct {
	File      string
	Active    bool
	Variables map[string]string
}

type Services []Service
