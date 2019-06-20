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
	ID   bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name string        `json:"name" bson:"name"`
	Host string        `json:"host" bson:"host" validate:"required"`
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

// GetCompleteHost get tfmt.Sprintf("he tcp url if the port is empty return the socket
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
