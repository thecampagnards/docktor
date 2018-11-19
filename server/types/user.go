package types

import (
	"github.com/globalsign/mgo/bson"
)

var (
	// ROLES List of user rights
	ROLES = [...]string{"admin", "user"}
)

type User struct {
	Username  string
	Firstname string
	Lastname  string
	Salt      string
	Password  string
	Email     string
	Groups    []bson.ObjectId
	Role      string
}
