package types

import (
	"bytes"
	"html/template"

	"github.com/globalsign/mgo/bson"
)

const (
	FORM_DATA_IMAGES_FIELD_NAME = "images"
	FORM_DATA_FILES_FIELD_NAME  = "files"
	FORM_DATA_DATA_FIELD_NAME   = "data"
)

type Service struct {
	ID          bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string
	Description string
	// Base 64 encoded
	Image       []byte
	SubServices []SubService
}

type SubService struct {
	ID        bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name      string
	File      string
	Active    bool
	Variables interface{}
}

type Services []Service

// ConvertSubService this methode replace all the variables in the service
func (sub SubService) ConvertSubService(variables interface{}) ([]byte, error) {

	tmpl, err := template.New("template").Parse(sub.File)
	if err != nil {
		return nil, err
	}
	var b bytes.Buffer

	err = tmpl.Execute(&b, variables)
	if err != nil {
		return nil, err
	}

	return b.Bytes(), nil
}
