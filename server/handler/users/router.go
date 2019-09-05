package users

import (
	"docktor/server/middleware"
	"fmt"

	"docktor/server/types"

	"github.com/labstack/echo/v4"
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

		user.GET("", getByUsername)
		user.DELETE("", deleteByUsername, middleware.WithAdmin)
	}

	e.POST("/register", register)
}

// AddAuthRoute add route on echo
func AddAuthRoute(e *echo.Group, jwtSecret string) {
	e.POST("/login", login(jwtSecret))
}
