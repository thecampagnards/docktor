package groups

import (
	"fmt"

	"docktor/server/middleware"
	"docktor/server/types"

	"github.com/labstack/echo/v4"
)

// AddRoute add route on echo
func AddRoute(e *echo.Group) {
	groups := e.Group("/groups")

	// Basic daemon request
	groups.GET("", getAllWithDaemons)
	groups.POST("", save)

	{
		group := groups.Group(fmt.Sprintf("/:%s", types.GROUP_ID_PARAM))
		group.Use(middleware.WithGroup)

		group.GET("", getByID)
		group.DELETE("", deleteByID, middleware.WithAdmin)
		group.POST("/updateuser/:username/:status", updateUser, middleware.WithGroupAdmin)

		{
			// Compose requests
			compose := group.Group("/compose")
			compose.POST(fmt.Sprintf("/start/:%s", types.SUBSERVICE_ID_PARAM), startServiceGroup)
			compose.POST(fmt.Sprintf("/create/:%s", types.SUBSERVICE_ID_PARAM), createServiceGroup)
			compose.GET(fmt.Sprintf("/file/:%s", types.SUBSERVICE_ID_PARAM), getServiceGroupFile, middleware.WithAdmin)
		}

		{
			// Docker requests
			docker := group.Group("/docker/containers")
			docker.GET("", getContainers)
			docker.POST("", saveContainers)
		}

		{
			// CAdvisor requests
			cadvisor := group.Group("/cadvisor")
			cadvisor.GET("", getCAdvisorInfo)
		}
	}
}
