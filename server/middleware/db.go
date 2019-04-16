package middleware

import (
	"docktor/server/storage"

	"github.com/labstack/echo"
)

// DB is a middleware injecting the DB to the Echo context
func DB(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		dock, err := storage.Get()
		if err != nil {
			c.Error(err)
		}
		defer dock.Close()
		c.Set("DB", dock)
		return next(c)
	}
}
