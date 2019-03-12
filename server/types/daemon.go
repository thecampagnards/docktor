package types

import (
	"strconv"

	"github.com/globalsign/mgo/bson"
)

var (
	WATCHTOWER_LABEL = "com.centurylinklabs.watchtower.enable=true"
)

type Daemon struct {
	ID          bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string
	Description string
	Tags        []string
	CAdvisor    string
	Host        string
	Docker      Docker
	SSH         SSH
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
	return d.Host
}
