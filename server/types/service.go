package types

import (
	"bytes"
	"html/template"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/globalsign/mgo/bson"
)

type Service struct {
	ID          bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string
	Description string
	Tags        []string
	Link        string
	// Base 64 encoded
	Image       string
	SubServices []SubService
}

type SubService struct {
	ID        bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name      string
	File      string
	Active    bool
	Variables interface{} `bson:"-"`
}

type Services []Service

// GetRemoteFile Check if file is remote and pull it
func (sub *SubService) GetRemoteFile() (err error) {
	u, err := url.ParseRequestURI(sub.File)
	if err != nil || u.Host == "" {
		return nil
	}

	cli := &http.Client{Timeout: 10 * time.Second}
	r, err := cli.Get(sub.File)
	if err != nil {
		return
	}
	defer r.Body.Close()

	buf := new(bytes.Buffer)
	buf.ReadFrom(r.Body)

	sub.File = buf.String()
	return
}

// ConvertSubService this methode replace all the variables in the service
func (sub SubService) ConvertSubService(variables interface{}) ([]byte, error) {

	err := sub.GetRemoteFile()
	if err != nil {
		return nil, err
	}

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

	err := sub.GetRemoteFile()
	if err != nil {
		return err
	}

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
