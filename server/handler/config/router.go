package config

import (
	"docktor/server/middleware"

	"github.com/labstack/echo"
)

// AddRoute add route on echo
func AddRoute(e *echo.Group) {
	config := e.Group("/config")

	{
		message := config.Group("/message")
		message.GET("", getMessage)
		message.POST("", saveMessage, middleware.WithAdmin)
	}
}
