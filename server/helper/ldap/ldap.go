package ldap

import (
	"crypto/tls"
	"errors"
	"fmt"

	ldap "gopkg.in/ldap.v3"
)

// AuthConfig defines the configuration for an LDAP authentication
type AuthConfig struct {
	Host         string
	Port         int
	Secure       bool
	BindDN       string
	BindPassword string
}

// SearchConfig defines the configuration for searching users inside an LDAP tree
type SearchConfig struct {
	BaseDN       string
	SearchFilter string
	Attributes   Attributes
}

// Attributes defines the users attributes to retrieve from the LDAP
type Attributes struct {
	Username  string `json:"Username" validate:"required"`
	FirstName string `json:"FirstName"`
	LastName  string `json:"LastName"`
	Email     string `json:"Email"`
}

// Handler stores an LDAP configuration and allows to perform LDAP related operations
type Handler struct {
	AuthConfig   AuthConfig
	SearchConfig SearchConfig
}

// New initializes an LDAP handler
func New(authConfig AuthConfig, searchConfig SearchConfig) *Handler {
	return &Handler{
		AuthConfig:   authConfig,
		SearchConfig: searchConfig,
	}
}

// Auth authenticates a user to an LDAP
func (h *Handler) Auth(username, password string) (attr Attributes, err error) {

	var l *ldap.Conn
	if h.AuthConfig.Secure {
		// TLS, for testing purposes disable certificate verification, check https://golang.org/pkg/crypto/tls/#Config for further information.
		// That's for ldaps
		tlsConfig := &tls.Config{InsecureSkipVerify: true}
		l, err = ldap.DialTLS("tcp", fmt.Sprintf("%s:%d", h.AuthConfig.Host, h.AuthConfig.Port), tlsConfig)
	} else {
		l, err = ldap.Dial("tcp", fmt.Sprintf("%s:%d", h.AuthConfig.Host, h.AuthConfig.Port))
	}

	if err != nil {
		return
	}
	defer l.Close()

	err = l.Bind(h.AuthConfig.BindDN, h.AuthConfig.BindPassword)
	if err != nil {
		return
	}

	searchRequest := ldap.NewSearchRequest(
		h.SearchConfig.BaseDN,
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		fmt.Sprintf(h.SearchConfig.SearchFilter, ldap.EscapeFilter(username)),
		[]string{
			h.SearchConfig.Attributes.Username,
			h.SearchConfig.Attributes.FirstName,
			h.SearchConfig.Attributes.LastName,
			h.SearchConfig.Attributes.Email,
		}, nil,
	)
	searchResult, err := l.Search(searchRequest)
	if err != nil {
		return
	}

	if len(searchResult.Entries) != 1 {
		err = errors.New("User does not exist or too many entries returned")
		return
	}

	userDN := searchResult.Entries[0].DN
	err = l.Bind(userDN, password)
	if err != nil {
		return
	}

	attr = Attributes{
		Username:  searchResult.Entries[0].GetAttributeValue(h.SearchConfig.Attributes.Username),
		FirstName: searchResult.Entries[0].GetAttributeValue(h.SearchConfig.Attributes.FirstName),
		LastName:  searchResult.Entries[0].GetAttributeValue(h.SearchConfig.Attributes.LastName),
		Email:     searchResult.Entries[0].GetAttributeValue(h.SearchConfig.Attributes.Email),
	}
	return
}
