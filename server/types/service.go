package types

import (
	"bytes"
	"fmt"
	"crypto/tls"
	"errors"
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
	Admin       bool          `json:"admin" bson:"admin"` // If it's only deployable by admins
}

// SubService data
type SubService struct {
	ID        bson.ObjectId     `json:"_id,omitempty" bson:"_id,omitempty"`
	Name      string            `json:"name" bson:"name" validate:"required"`
	Active    bool              `json:"active" bson:"active"`
	File      string            `json:"file,omitempty"  bson:"file" validate:"required"`
	Variables []ServiceVariable `json:"variables" bson:"-"`
	VersionIndex int 			`json:"version_index" bson:"version_index"`
	UpdateIndex int 			`json:"update_index" bson:"update_index"`
}

// ServiceVariable data
type ServiceVariable struct {
	Name     string `json:"name" bson:"name" validate:"required"`
	Value    string `json:"value" bson:"value"`
	Optional bool   `json:"optional" bson:"optional"`
	Secret   bool   `json:"secret" bson:"secret"`
}

// GetVariablesOfSubServices get all the variables of all subservices
func (s *Service) GetVariablesOfSubServices() (err error) {
	for i := 0; i < len(s.SubServices); i++ {
		err = s.SubServices[i].GetVariables()
		if err != nil {
			return
		}
	}
	return
}

// Services data
type Services []Service

// FindByName gets a service in a slice
func (services Services) FindByName(name string) (Service, error) {
	for _, s := range services {
		if strings.ToLower(s.Name) == strings.ToLower(name) {
			return s, nil
		}
	}
	return Service{}, fmt.Errorf("Service with name %q not found", name)
}

// ValidateServiceName checks if another service in the group has the same name
func ValidateServiceName(name string, group Group) error {

	// Check special characters
	r, _ := regexp.Compile(`[a-zA-Z0-9_-]+`)
	match := r.FindStringSubmatch(name)

	if len(match[0]) != len(name) {
		return errors.New("The service name should not contain special chars")
	}

	// Check other services names
	for _, s := range group.Services {
		if s.Name == name {
			return errors.New("This service name is already used in this group")
		}
	}

	return nil
}

// FindSubServiceByID find subservice by id
func (s *Service) FindSubServiceByID(id string) (*SubService, error) {
	for _, ss := range s.SubServices {
		if ss.ID.Hex() == id {
			return &ss, nil
		}
	}
	return nil, errors.New("No subservice found")
}

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
		Funcs(template.FuncMap{"split": split, "randString": randString, "toLower": toLower}).
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

	variables, err := FindTemplateVariables(sub.File, map[string]interface{}{
		"Group":       Group{},
		"Daemon":      Daemon{DaemonLight: DaemonLight{Host: "vm.loc.cn.ssg"}},
		"Service":     Service{Name: "Service"},
		"ServiceName": "myservice",
	})

	if err != nil {
		return
	}

	sub.Variables = make([]ServiceVariable, len(variables))
	for i := 0; i < len(variables); i++ {
		sub.Variables[i] = parseVar(variables[i])
	}

	return
}

// parseVar parses a variable to return a ServiceVariable
func parseVar(variable string) ServiceVariable {
	r, _ := regexp.Compile(`(optional_)?(secret_)?([a-zA-Z_]+)`)
	match := r.FindStringSubmatch(variable)

	serviceVar := ServiceVariable{
		Name:     variable,
		Value:    "",
		Secret:   len(match[2]) != 0,
		Optional: len(match[1]) != 0,
	}

	return serviceVar
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

// toLower used in go template
func toLower(s string) string {
	return strings.ToLower(s)
}
