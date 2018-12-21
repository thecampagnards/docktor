package types

import (
	"github.com/globalsign/mgo/bson"
)

var (
	ADMIN_ROLE = "admin"
	USER_ROLE  = "user"
	// ROLES List of user rights
	ROLES = [...]string{ADMIN_ROLE, USER_ROLE}
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

type Users []User

// IsAdmin check is user is admin
func (u User) IsAdmin() bool {
	return u.Role == ADMIN_ROLE
}

// IsMyGroup check if this is a group of the user
func (u User) IsMyGroup(g Group) bool {

	if u.IsAdmin() {
		return true
	}

	for _, group := range u.Groups {
		if group == g.ID {
			return true
		}
	}
	return false
}
