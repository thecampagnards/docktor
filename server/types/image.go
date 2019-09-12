package types

import (
	"bytes"
	"html/template"
	"regexp"

	"github.com/globalsign/mgo/bson"
)

// Image data
type Image struct {
	ID           bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Title        string        `json:"title" bson:"title"`
	Image        bson.RegEx    `json:"image" bson:"image"`
	Commands     []Command     `json:"commands" bson:"commands"`
	IsAllowShell bool          `json:"is_allow_shell" bson:"is_allow_shell"`
}

// Command data
type Command struct {
	ID        bson.ObjectId     `json:"_id,omitempty" bson:"_id,omitempty"`
	Title     string            `json:"title" bson:"title"`
	Command   string            `json:"command" bson:"command"`
	Variables []CommandVariable `json:"variables" bson:"-"`
}

// CommandVariable data
type CommandVariable struct {
	Name     string `json:"name" bson:"name" validate:"required"`
	Value    string `json:"value" bson:"value"`
	Optional bool   `json:"optional" bson:"optional"`
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
	variables, err := FindTemplateVariables(cmd.Command, nil)

	cmd.Variables = make([]CommandVariable, len(variables))
	for i := 0; i < len(variables); i++ {
		cmd.Variables[i] = parseCmdVar(variables[i])
	}

	return err
}

// GetCommandsVariables retrieve the commands variables
func (img *Image) GetCommandsVariables() (err error) {
	for index := 0; index < len(img.Commands); index++ {
		err = img.Commands[index].GetVariables()
		if err != nil {
			return err
		}
	}
	return err
}

// parseVar parses a variable to return a CommandVariable
func parseCmdVar(variable string) CommandVariable {
	r, _ := regexp.Compile(`(optional_)?([a-zA-Z_]+)`)
	match := r.FindStringSubmatch(variable)

	cmdVar := CommandVariable{
		Name:     match[2],
		Value:    "",
		Optional: false,
	}

	if len(match[1]) != 0 {
		cmdVar.Optional = true
	}

	return cmdVar
}
