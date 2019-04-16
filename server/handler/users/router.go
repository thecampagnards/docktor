package users

import (
	"fmt"

	"docktor/server/middleware"
	"docktor/server/types"

	"github.com/labstack/echo"
)

// AddRoute add route on echo
func AddRoute(e *echo.Group) {
	users := e.Group("/users")

	// Basic users request
	users.GET("", getAll)
	users.POST("", save)
	users.GET("/profile", profile)

	{
		user := users.Group(fmt.Sprintf("/:%s", types.USERNAME_PARAM))
		user.Use(middleware.WithAdmin)

		user.GET("", getByUsername)
		user.DELETE("", deleteByUsername)
	}
}

// AddAuthRoute add route on echo
func AddAuthRoute(e *echo.Group) {
	e.POST("/login", login)
}
