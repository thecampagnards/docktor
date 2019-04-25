package images

import (
	"fmt"

	"docktor/server/middleware"
	"docktor/server/types"

	"github.com/labstack/echo"
)

// AddRoute add route on echo
func AddRoute(e *echo.Group) {
	images := e.Group("/images")

	// Basic image request
	images.GET("", getAll)
	images.POST("", save, middleware.WithAdmin)

	{
		image := images.Group(fmt.Sprintf("/:%s", types.COMMAND_IMAGE_PARAM))
		image.GET("", getByImage)
		image.DELETE("", deleteByImage, middleware.WithAdmin)
	}
}
