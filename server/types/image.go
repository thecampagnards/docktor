package types

import (
	"bytes"
	"html/template"

	"github.com/globalsign/mgo/bson"
)

// Image data
type Image struct {
	ID           bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Image        bson.RegEx    `json:"image" bson:"image"`
	Commands     []Command     `json:"commands" bson:"commands"`
	IsAllowShell bool          `json:"is_allow_shell" bson:"is_allow_shell"`
}

// Command data
type Command struct {
	ID        bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Title     string        `json:"title" bson:"title"`
	Command   string        `json:"command" bson:"command"`
	Variables interface{}   `json:"variables" bson:"-"`
}

// Images data
type Images []Image

// SetVariables this methode replace all the variables in the command and return the string
func (cmd *Command) SetVariables(variables interface{}) (string, error) {

	// Convert it
	tmpl, err := template.New("template").
		Funcs(template.FuncMap{"split": split, "randString": randString}).
		Parse(cmd.Command)
	if err != nil {
		return "", err
	}
	var b bytes.Buffer

	err = tmpl.Execute(&b, variables)

	return string(b.Bytes()), err
}

// GetVariables retrieve the variables of a template
func (cmd *Command) GetVariables() (err error) {
	cmd.Variables, err = FindTemplateVariables(cmd.Command, nil)
	return err
}

// GetCommandsVariables retrieve the commands variables
func (img *Image) GetCommandsVariables() (err error) {
	for index := 0; index < len(img.Commands); index++ {
		img.Commands[index].Variables, err = FindTemplateVariables(img.Commands[index].Command, nil)
	}
	return err
}
