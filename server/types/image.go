package types

import (
	"github.com/globalsign/mgo/bson"
)

// Image data
type Image struct {
	Image    bson.RegEx `json:"image" bson:"image"`
	Commands []Command  `json:"commands" bson:"commands"`
}

// Command data
type Command struct {
	Title     string      `json:"title" bson:"title"`
	Command   string      `json:"command" bson:"command"`
	Variables interface{} `json:"variables" bson:"-"`
}

// Images data
type Images []Image

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
