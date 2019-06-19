package middleware

import (
	"docktor/server/helper/ldap"

	"github.com/labstack/echo/v4"
)

// LDAP is a middleware injecting the LDAP configuration to the Echo context
func LDAP(authConfig ldap.AuthConfig, searchConfig ldap.SearchConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			l := ldap.New(authConfig, searchConfig)
			c.Set("ldap", l)
			return next(c)
		}
	}
}
