package utils

import (
        "os"
	"io/ioutil"
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
