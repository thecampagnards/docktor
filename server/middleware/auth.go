package middleware

import (
	"net/http"

	"docktor/server/handler/users"

	"github.com/labstack/echo"
)

// IsAdmin is used to check if the connected user is admin
func IsAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user, err := users.AuthUser(c)

		if err != nil {
			c.Logger().Errorf("Admin access denied: requestURI: %s, error: %s", c.Request().RequestURI, err)
			return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
		}

		if !user.IsAdmin() {
			c.Logger().Warnf("Admin access denied: requestURI: %s, username %s", c.Request().RequestURI, user.Username)
			return echo.NewHTTPError(http.StatusForbidden, "Admin access denied")
		}

		c.Logger().Infof("Admin access granted: requestURI: %s, username %s", c.Request().RequestURI, user.Username)

		c.Set("user", user)
		return next(c)
	}
}

// WithUser
func WithUser(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user, err := users.AuthUser(c)
		if err != nil {
			return echo.NewHTTPError(http.StatusForbidden, err.Error())
		}

		c.Set("user", user)
		return next(c)
	}
}

// WithGroup
func WithGroup(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user, err := users.AuthUser(c)
		if err != nil {
			return echo.NewHTTPError(http.StatusForbidden, err.Error())
		}

		c.Set("user", user)
		return next(c)
	}
}
