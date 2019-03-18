package types

import (
	"crypto/sha256"
	"docktor/server/helper/ldap"
	"fmt"
	"math/rand"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/globalsign/mgo/bson"
)

// CustomClaims contains claims identifying the owner of a token
type CustomClaims struct {
	Username string `json:"username"`
}

// Claims contains standard JWT claims and custom claims
type Claims struct {
	CustomClaims
	jwt.StandardClaims
}

type User struct {
	ldap.Attributes
	Salt     string
	Password string
	Groups   []bson.ObjectId
	Admin    string
	Role     string
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

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, Claims{
		CustomClaims{
			u.Username,
		},
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(authValidity).Unix(),
			IssuedAt:  time.Now().Unix(),
		},
	})

	return token.SignedString([]byte("secret"))
}

// CheckPassword
func (u User) CheckPassword(password string) bool {
	return u.EncodePassword(password) == u.Password
}

// EncodePassword
func (u *User) EncodePassword(password string) string {
	h := sha256.New()
	if u.Salt == "" {
		u.Salt = randomString(12)
	}
	h.Write([]byte(u.Salt + password))
	return fmt.Sprintf("%x", h.Sum(nil))
}

func randomString(len int) string {
	bytes := make([]byte, len)
	for i := 0; i < len; i++ {
		bytes[i] = byte(65 + rand.Intn(25)) //A=65 and Z = 65+25
	}
	return string(bytes)
}
