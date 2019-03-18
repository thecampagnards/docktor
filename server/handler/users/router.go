package users

import (
	"fmt"

	customMiddleware "docktor/server/middleware"
	"docktor/server/types"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

// AddRoute add route on echo
func AddRoute(e *echo.Group) {
	users := e.Group("/users")

	// Basic users request
	users.GET("", getAll)
	users.POST("", save)
	users.POST("/login&ldap=true", loginLDAP)
	users.POST("/login", loginLocal)
	users.GET("/profile", profile, middleware.JWT([]byte("secret")), customMiddleware.WithUser)

	{
		user := users.Group(fmt.Sprintf("/:%s", types.USERNAME_PARAM))

		user.GET("", getByUsername)
		user.DELETE("", deleteByUsername)
	}
}
