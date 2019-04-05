package types

import (
	"fmt"

	"github.com/globalsign/mgo/bson"
)

// DaemonLight data
type DaemonLight struct {
	ID   bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name string        `json:"name" bson:"name"`
}

// Daemon data
type Daemon struct {
	DaemonLight `bson:",inline"`
	Host        string   `json:"host" bson:"host" validate:"required"`
	Tags        []string `json:"tags" bson:"tags"`
	Description string   `json:"description" bson:"description"`
	CAdvisor    string   `json:"cadvisor" bson:"cadvisor"`
	Docker      Docker   `json:"docker" bson:"docker"`
	SSH         SSH      `json:"ssh" bson:"ssh"`
}

// Docker data
type Docker struct {
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
