package groups

import (
	"fmt"

	"docktor/server/middleware"
	"docktor/server/types"

	"github.com/labstack/echo"
)

// AddRoute add route on echo
func AddRoute(e *echo.Group) {
	groups := e.Group("/groups")

	// Basic daemon request
	groups.GET("", getAllWithDaemons)
	groups.POST("", save, middleware.WithAdmin)

	{
		group := groups.Group(fmt.Sprintf("/:%s", types.GROUP_ID_PARAM))

		group.GET("", getByID)
		group.DELETE("", deleteByID, middleware.WithAdmin)
		group.POST("/start/:subserviceID", startSubService)
		group.POST("/create/:subserviceID", createSubService)
		group.GET("/containers", getContainers)
	}
}
