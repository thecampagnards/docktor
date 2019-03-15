package types

import (
	"docktor/server/helper/ldap"
	"os"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/globalsign/mgo/bson"
)

var (
	ADMIN_ROLE = "admin"
	USER_ROLE  = "user"
	// ROLES List of user rights
	ROLES = [...]string{ADMIN_ROLE, USER_ROLE}
)

type User struct {
	ldap.Attributes
	Salt     string
	Password string
	Groups   []bson.ObjectId
	Admin    string
	jwt.StandardClaims
}

type Users []User

// IsAdmin check is user is admin
func (u User) IsAdmin() bool {
	return u.Admin == ADMIN_ROLE
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

// CreateToken create a jwt token for user
func (u User) CreateToken() (string, error) {
	u.StandardClaims = jwt.StandardClaims{
		ExpiresAt: time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, u)

	jwtKey := os.Getenv("JWT_SECRET")
	if jwtKey == "" {
		jwtKey = "secret"
	}

	return token.SignedString([]byte(jwtKey))
}
