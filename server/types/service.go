package types

import "github.com/globalsign/mgo/bson"

const (
	FORM_DATA_IMAGES_FIELD_NAME = "images"
	FORM_DATA_FILES_FIELD_NAME  = "files"
	FORM_DATA_DATA_FIELD_NAME   = "data"
)

type Service struct {
	ID   bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name string
	// Base 64 encoded
	Image       []byte
	SubServices []SubService
}

type SubService struct {
	ID        bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	File      string
	Active    bool
	Variables interface{}
}

type Services []Service
