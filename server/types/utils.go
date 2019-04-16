package types

import (
	"io/ioutil"
	"os"
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
