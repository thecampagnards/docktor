package types

import (
	"crypto/sha256"
	"docktor/server/helper/ldap"
	"fmt"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
)

// Claims contains standard JWT claims and custom claims
type Claims struct {
	Username string `json:"username"`
	IsAdmin  bool   `json:"isAdmin"`
	jwt.StandardClaims
}

// UserLight data
type UserLight struct {
	ldap.Attributes `bson:",inline"`
	Role            string `json:"role" bson:"role"`
}

// User data
type User struct {
	UserLight `bson:",inline"`
	Salt      string `json:"-" bson:"salt,omitempty"`
	Password  string `json:"password,omitempty" bson:"password,omitempty"`
}

// Profile data
type Profile struct {
	UserLight   `bson:",inline"`
	GroupsLight GroupsLight `json:"groups"`
}

// Users data
type Users []User

// Profiles data
type Profiles []Profile

// IsAdmin check is user is admin
func (u *User) IsAdmin() bool {
	return u.Role == ADMIN_ROLE
}

// CreateToken create a jwt token for user
func (u *User) CreateToken(jwtSecret string) (string, error) {

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &Claims{
		u.Username,
		u.IsAdmin(),
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(authValidity).Unix(),
			IssuedAt:  time.Now().Unix(),
		},
	})

	return token.SignedString([]byte(jwtSecret))
}

// CheckPassword check if it's the right password
func (u *User) CheckPassword(password string) bool {
	return u.EncodePassword(password) == u.Password
}

// EncodePassword encode the password if no slat create one
func (u *User) EncodePassword(password string) string {
	h := sha256.New()
	if u.Salt == "" {
		u.Salt = randString(12)
	}
	h.Write([]byte(u.Salt + password))
	return fmt.Sprintf("%x", h.Sum(nil))
}
