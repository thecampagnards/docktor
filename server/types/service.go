package types

import (
	"bytes"
	"html/template"
	"regexp"
	"strings"

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
	Tags        []string
	Link        string
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

// GetVariablesOfSubServices retrieve the variables of a template
func (sub *SubService) GetVariablesOfSubServices() error {

	tmpl, err := template.New("").Option("missingkey=error").Parse(sub.File)
	if err != nil {
		return err
	}

	var b bytes.Buffer
	var data = make(map[string]interface{})
	data["Group"] = Group{}
	data["Daemon"] = Daemon{}
	var keys []string
	r, _ := regexp.Compile(`key "(.*?)"`)

	for {
		err = tmpl.Execute(&b, data)
		if err != nil {
			if !strings.Contains(err.Error(), "map has no entry key") {
				// r, _ := regexp.Compile("<(.*)>")
				// field := r.FindStringSubmatch(err.Error())[1]
				key := r.FindStringSubmatch(err.Error())[1]
				data[key] = "<no value>"
				keys = append(keys, key)
				b.Reset()
			} else {
				return err
			}
		} else {
			break
		}
	}

	sub.Variables = keys
	return nil
}
