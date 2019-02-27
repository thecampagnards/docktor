package utils

import (
	"docktor/server/types"

	"bytes"
	"fmt"

	"golang.org/x/crypto/ssh"
)

// GetSSHSession return ssh session
func GetSSHSession(daemon types.Daemon) (*ssh.Client, *ssh.Session, error) {

	if daemon.SSH.Port == 0 {
		daemon.SSH.Port = 22
	}

	config := &ssh.ClientConfig{
		User: daemon.SSH.User,
		Auth: []ssh.AuthMethod{
			ssh.Password(daemon.SSH.Password),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}

	client, err := ssh.Dial("tcp", fmt.Sprintf("%s:%v", daemon.Host, daemon.SSH.Port), config)
	if err != nil {
		return nil, nil, err
	}

	session, err := client.NewSession()
	if err != nil {
		client.Close()
		return nil, nil, err
	}

	return client, session, nil
}

// ExecSSH exec command on daemon
func ExecSSH(daemon types.Daemon, cmd string) (string, error) {

	client, session, err := GetSSHSession(daemon)
	if err != nil {
		return "", err
	}
	defer client.Close()
	defer session.Close()

	var b bytes.Buffer
	session.Stdout = &b

	err = session.Run(cmd)
	return b.String(), err
}
