package types

import (
	"bytes"
	"crypto/tls"
	"html/template"
	"math/rand"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/globalsign/mgo/bson"
)

// Service data
type Service struct {
	ID          bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string        `json:"name" bson:"name" validate:"required"`
	Description string        `json:"description" bson:"description"`
	Tags        []string      `json:"tags" bson:"tags"`
	Link        string        `json:"link" bson:"link"`
	Image       string        `json:"image" bson:"image"` // Base 64 encoded
	SubServices []SubService  `json:"sub_services" bson:"sub_services"`
}

// SubService data
type SubService struct {
	ID        bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name      string        `json:"name" bson:"name" validate:"required"`
	Active    bool          `json:"active" bson:"active"`
	File      string        `json:"file,omitempty"  bson:"file" validate:"required"`
	Variables interface{}   `bson:"-"`
}

// GetVariablesOfSubServices get all the variables of all subservices
func (s *Service) GetVariablesOfSubServices() {
	for index := 0; index < len(s.SubServices); index++ {
		s.SubServices[index].GetVariables()
	}
}

// Services data
type Services []Service

// GetRemoteFile Check if file is remote and pull it
func (sub *SubService) GetRemoteFile() (err error) {
	u, err := url.ParseRequestURI(sub.File)
	// Check if plain file or url
	if err != nil || u.Host == "" {
		return nil
	}

	cli := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			// Disable https check
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	// Get the template file
	r, err := cli.Get(sub.File)
	if err != nil {
		return
	}
	defer r.Body.Close()

	// Convert to string
	buf := new(bytes.Buffer)
	buf.ReadFrom(r.Body)

	sub.File = buf.String()
	return
}

// ConvertSubService this methode replace all the variables in the service
func (sub *SubService) ConvertSubService(variables interface{}) ([]byte, error) {

	// Get remote file if needed
	err := sub.GetRemoteFile()
	if err != nil {
		return nil, err
	}

	// Convert it
	tmpl, err := template.New("template").
		Funcs(template.FuncMap{"split": split, "randString": randString}).
		Parse(sub.File)
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

// GetVariables retrieve the variables of a template
func (sub *SubService) GetVariables() (err error) {

	// Get remote file if needed
	err = sub.GetRemoteFile()
	if err != nil {
		return
	}

	// Convert it and enable missingkey to find the missing variables
	tmpl, err := template.New("template").
		Funcs(template.FuncMap{"split": split, "randString": randString}).
		Option("missingkey=error").
		Parse(sub.File)
	if err != nil {
		return
	}

	data := map[string]interface{}{
		"Group":  Group{},
		"Daemon": Daemon{Host: "vm.loc.cn.ssg"},
	}

	r, _ := regexp.Compile(`map has no entry for key "(.*?)"`)

	var variables []string
	var b bytes.Buffer
	for {
		err = tmpl.Execute(&b, data)
		if err != nil {
			if len(r.FindStringIndex(err.Error())) > 0 {
				variable := r.FindStringSubmatch(err.Error())[1]
				data[variable] = "<no value>"
				variables = append(variables, variable)
				b.Reset()
			} else {
				return err
			}
		} else {
			break
		}
	}

	sub.Variables = variables
	return nil
}

// split used in go template
func split(s string, d string) []string {
	return strings.Split(d, s)
}

// randString used in go template
func randString(n int) string {
	const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	b := make([]byte, n)
	for i := range b {
		b[i] = letterBytes[rand.Intn(len(letterBytes))]
	}
	return string(b)
}
