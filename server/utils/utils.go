package utils

import (
	"io/ioutil"
)

// WriteStringToFile
func WriteStringToFile(content string) (string, error) {

	tmpfile, err := ioutil.TempFile("", "")
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
