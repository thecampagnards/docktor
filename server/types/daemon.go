package types

import (
	"strconv"

	"github.com/globalsign/mgo/bson"
)

type Daemon struct {
	ID          bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string
	Description string
	Tags        []string
	CAdvisor    string `json:",omitempty"`
	Host        string
	Docker      Docker `json:",omitempty"`
	SSH         SSH    `json:",omitempty"`
}

type Docker struct {
	Port   int
	Volume string
	Cert
}

type SSH struct {
	Port     int
	User     string
	Password string
	Commands []string
}

type Cert struct {
	Cert string
	Ca   string
	Key  string
}

type Daemons []Daemon

// GetCompleteHost
func (d Daemon) GetCompleteHost() string {
	if d.Docker.Port != 0 {
		return "tcp://" + d.Host + ":" + strconv.Itoa(d.Docker.Port)
	}
	// Can be a socket
	return "unix:///" + d.Host
}
