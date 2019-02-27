package types

import (
	"strconv"

	"github.com/globalsign/mgo/bson"
)

type Daemon struct {
	ID          bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string
	Description string
	CAdvisor    string
	Host        string
	Port        int
	Volume      string
	Cert
	SSH
}

type SSH struct {
	Port     int
	User     string
	Password string
}

type Cert struct {
	Cert string
	Ca   string
	Key  string
}

type Daemons []Daemon

// GetCompleteHost
func (d Daemon) GetCompleteHost() string {
	if d.Port != 0 {
		return "tcp://" + d.Host + ":" + strconv.Itoa(d.Port)
	}
	// Can be a socket
	return d.Host
}
