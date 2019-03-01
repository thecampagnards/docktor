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

// ExecSSH exec commands on daemon return the results
func ExecSSH(daemon types.Daemon, cmds ...string) (map[string]string, error) {

	client, session, err := GetSSHSession(daemon)
	if err != nil {
		return nil, err
	}
	defer client.Close()
	defer session.Close()

	var b bytes.Buffer
	session.Stdout = &b

	results := make(map[string]string)

	for _, cmd := range cmds {
		err = session.Run(cmd)
		if err != nil {
			results[cmd] = err.Error()
		} else {
			results[cmd] = b.String()
		}
		b.Reset()
	}

	return results, err
}
