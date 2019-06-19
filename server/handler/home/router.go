package home

import (
	"github.com/labstack/echo/v4"
)

// AddRoute add route on echo
func AddRoute(e *echo.Group) {
	home := e.Group("/home")
	home.GET("", getHomePage)
}
