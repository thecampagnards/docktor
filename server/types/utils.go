package types

import (
	"bytes"
	"html/template"
	"io/ioutil"
	"os"
	"regexp"
)

// WriteStringToFile
func WriteStringToFile(content string) (string, error) {

	// Check if tempDir exist if not create it
	if _, err := os.Stat(os.TempDir()); os.IsNotExist(err) {
		os.MkdirAll(os.TempDir(), os.ModePerm)
	}

	tmpfile, err := ioutil.TempFile("", "*")
	if err != nil {
		return "", err
	}

	if _, err := tmpfile.Write([]byte(content)); err != nil {
		return "", err
	}
	if err := tmpfile.Close(); err != nil {
		return "", err
	}

	return tmpfile.Name(), nil
}

// Remove removes a value in a string array
func Remove(array []string, value string) []string {
	for i, v := range array {
		if v == value {
			array[i] = array[len(array)-1]
			return array[:len(array)-1]
		}
	}
	return array
}

// FindTemplateVariables retrieve the variables of a go template
func FindTemplateVariables(file string, defaultVariables map[string]interface{}) (variables []string, err error) {

	if defaultVariables == nil {
		defaultVariables = make(map[string]interface{})
	}

	// Convert it and enable missingkey to find the missing variables
	tmpl, err := template.New("template").
		Funcs(template.FuncMap{"split": split, "randString": randString}).
		Option("missingkey=error").
		Parse(file)
	if err != nil {
		return
	}

	r, _ := regexp.Compile(`map has no entry for key "(.*?)"`)

	var b bytes.Buffer
	for {
		err = tmpl.Execute(&b, defaultVariables)
		if err != nil {
			if len(r.FindStringIndex(err.Error())) > 0 {
				variable := r.FindStringSubmatch(err.Error())[1]
				defaultVariables[variable] = "<no value>"
				variables = append(variables, variable)
				b.Reset()
			} else {
				return nil, err
			}
		} else {
			break
		}
	}

	return variables, nil
}
