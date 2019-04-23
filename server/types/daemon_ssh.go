package types

import (
	"bytes"
	"fmt"
	"net"

	"golang.org/x/crypto/ssh"
)

// GetSSHSession return ssh session
func (d *Daemon) GetSSHSession() (*ssh.Client, *ssh.Session, error) {

	if d.SSH.Port == 0 {
		d.SSH.Port = 22
	}

	config := &ssh.ClientConfig{
		User: d.SSH.User,
		Auth: []ssh.AuthMethod{
			ssh.Password(d.SSH.Password),
		},
		HostKeyAlgorithms: []string{
			ssh.KeyAlgoRSA,
			ssh.KeyAlgoDSA,
			ssh.KeyAlgoECDSA256,
			ssh.KeyAlgoECDSA384,
			ssh.KeyAlgoECDSA521,
			ssh.KeyAlgoED25519,
		},
		HostKeyCallback: func(hostname string, remote net.Addr, key ssh.PublicKey) error {
			fmt.Println(hostname)
			fmt.Println(key)
			return nil
		},
		BannerCallback: func(banner string) error {
			fmt.Println(banner)
			return nil

		},
		// HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}

	// Use IP for SSH due to resolv problems
	ip, _ := net.LookupIP(d.Host)
	if len(ip) > 0 {
		d.Host = ip[0].String()
	}

	fmt.Println()
	fmt.Printf("%s:%v", d.Host, d.SSH.Port)
	fmt.Println()

	client, err := ssh.Dial("tcp", fmt.Sprintf("%s:%v", d.Host, d.SSH.Port), config)
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
func (d *Daemon) ExecSSH(cmds ...string) (map[string]string, error) {

	client, session, err := d.GetSSHSession()
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
