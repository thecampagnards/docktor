package types

import (
	"crypto/sha256"
	"docktor/server/helper/ldap"
	"fmt"
	"math/rand"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
)

// CustomClaims contains claims identifying the owner of a token
type CustomClaims struct {
	Username string
	IsAdmin  bool
}

// Claims contains standard JWT claims and custom claims
type Claims struct {
	CustomClaims
	jwt.StandardClaims
}

type User struct {
	ldap.Attributes
	Salt     string `json:"-"`
	Password string `json:",omitempty"`
	Role     string
}

type UserRest struct {
	User       `bson:",inline"`
	GroupsData *GroupsRest `json:",omitempty" bson:",omitempty"`
}

type Users []User
type UsersRest []UserRest

// IsAdmin check is user is admin
func (u User) IsAdmin() bool {
	return u.Role == ADMIN_ROLE
}

// CreateToken create a jwt token for user
func (u User) CreateToken(jwtSecret string) (string, error) {

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &Claims{
		CustomClaims{
			u.Username,
			u.IsAdmin(),
		},
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(authValidity).Unix(),
			IssuedAt:  time.Now().Unix(),
		},
	})

	return token.SignedString([]byte(jwtSecret))
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
