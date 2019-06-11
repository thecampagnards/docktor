package home

import (
	"github.com/labstack/echo"
)

// AddRoute add route on echo
func AddRoute(e *echo.Group) {
	home := e.Group("/home")
	home.GET("", getHomePage)
}
