package types

import (
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"strings"
	"time"

	"github.com/globalsign/mgo/bson"
)

// DaemonLight data
type DaemonLight struct {
	ID     bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name   string        `json:"name" bson:"name"`
	Host   string        `json:"host" bson:"host" validate:"required"`
	Docker struct {
		Status string `json:"status" bson:"-"`
	} `json:"docker" bson:"-"`
}

// Daemon data
type Daemon struct {
	DaemonLight `bson:",inline"`
	Tags        []string `json:"tags" bson:"tags"`
	Description string   `json:"description" bson:"description"`
	CAdvisor    string   `json:"cadvisor" bson:"cadvisor"`
	Docker      Docker   `json:"docker" bson:"docker"`
	SSH         SSH      `json:"ssh" bson:"ssh"`
}

// RundeckDaemon data
type RundeckDaemon struct {
	Nodename  string   `json:"nodename"`
	Hostname  string   `json:"hostname"`
	Username  string   `json:"username"`
	Tags      []string `json:"tags"`
	OsFamily  string   `json:"osFamily"`
	OsName    string   `json:"osName"`
	OsVersion string   `json:"osVersion"`
}

// Docker data
type Docker struct {
	Status string `json:"status" bson:"status"`
	Certs  `json:"certs" bson:"certs,inline"`
	Port   int    `json:"port" bson:"port"`
	Volume string `json:"volume" bson:"volume"`
}

// SSH data
type SSH struct {
	Port     int      `json:"port" bson:"port"`
	User     string   `json:"user" bson:"user"`
	Password string   `json:"password" bson:"password"`
	Commands []string `json:"commands" bson:"commands"`
}

// Certs data
type Certs struct {
	Cert string `json:"cert" bson:"cert"`
	Ca   string `json:"ca" bson:"ca"`
	Key  string `json:"key" bson:"key"`
}

// Daemons data
type Daemons []Daemon

// DaemonsLight data
type DaemonsLight []DaemonLight

// ToRundeck convert daemon format to rundeck format
func (d *Daemon) ToRundeck() RundeckDaemon {
	return RundeckDaemon{
		Nodename:  d.Name,
		Hostname:  d.Host,
		Username:  d.SSH.User,
		Tags:      d.Tags,
		OsFamily:  "unix",
		OsName:    "CentOS",
		OsVersion: "7.2",
	}
}

// GetCompleteHost get the docker complete host
func (d *Daemon) GetCompleteHost() string {
	if d.Docker.Port != 0 {
		return fmt.Sprintf("tcp://%s:%v", d.Host, d.Docker.Port)
	}
	return fmt.Sprintf("unix:///%s", d.Host)
}

// SetDockerStatus updates the docker status of a daemon
func (d *Daemon) SetDockerStatus() {

	_, err := d.GetDockerInfo()
	if err != nil {
		if strings.Contains(err.Error(), "client is newer than server") {
			d.Docker.Status = STATUS_OLD
			return
		}
		if strings.Contains(err.Error(), "tls: bad certificate") {
			d.Docker.Status = STATUS_CERT
			return
		}
		d.Docker.Status = STATUS_DOWN
		return
	}

	if (d.Docker.Certs != Certs{}) {
		// check cert expiration date
		block, _ := pem.Decode([]byte(d.Docker.Ca))
		ca, err := x509.ParseCertificate(block.Bytes)
		if err != nil {
			d.Docker.Status = ""
			return
		}

		if time.Until(ca.NotAfter) < time.Hour*168 {
			d.Docker.Status = STATUS_CERT
			return
		}
	}

	d.Docker.Status = STATUS_OK
	return
}
