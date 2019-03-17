package middleware

import (
	"github.com/labstack/echo"
)

// JWT is a middleware injecting the jwtSecret to the Echo context
func JWT(jwtSecret string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Set("jwtSecret", jwtSecret)
			return next(c)
		}
	}
}
