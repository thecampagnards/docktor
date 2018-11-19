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
}

type Cert struct {
	Cert string
	Ca   string
	Key  string
}

type Daemons []Daemon

// GetCompleteHost
func (d Daemon) GetCompleteHost() string {
	return "tcp://" + d.Host + ":" + strconv.Itoa(d.Port)
}
