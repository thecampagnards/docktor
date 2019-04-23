package commands

import (
	"fmt"

	"docktor/server/middleware"
	"docktor/server/types"

	"github.com/labstack/echo"
)

// AddRoute add route on echo
func AddRoute(e *echo.Group) {
	commands := e.Group("/commands")

	// Basic command request
	commands.GET("", getAll)
	commands.POST("", save, middleware.WithAdmin)

	{
		command := commands.Group(fmt.Sprintf("/:%s", types.COMMAND_IMAGE_PARAM))
		command.GET("", getByImage)
		command.DELETE("", deleteByImage, middleware.WithAdmin)
	}
}
