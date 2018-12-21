package main

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
)

// hasRole is a middleware checking if the currently authenticated users has sufficient privileges to reach a route
func hasRole(expectedRole types.Role) func(next echo.HandlerFunc) echo.HandlerFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Get user from context
			user := c.Get("authuser").(users.UserRest)

			// Check if the user has at least the required role
			log.WithFields(log.Fields{
				"username":     user.Username,
				"userRole":     user.Role,
				"expectedRole": expectedRole,
			}).Info("Checking if user has correct privileges")

			switch expectedRole {
			case types.AdminRole:
				if user.Role == types.AdminRole {
					return next(c)
				}
			case types.UserRole:
				return next(c)
			}

			// Refuse connection otherwise
			return c.String(http.StatusForbidden, fmt.Sprintf(NotAuthorized, user.Username))
		}
	}
}
