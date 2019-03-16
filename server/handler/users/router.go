package users

import (
	"fmt"

	"docktor/server/types"

	"github.com/labstack/echo"
)

// AddRoute add route on echo
func AddRoute(e *echo.Group) {
	users := e.Group("/users")

	// Basic users request
	users.GET("", getAll)
	users.POST("", save)
	users.POST("/login", login)

	{
		user := users.Group(fmt.Sprintf("/:%s", types.USERNAME_PARAM))

		user.GET("", getByUsername)
		user.DELETE("", deleteByUsername)
	}
}
