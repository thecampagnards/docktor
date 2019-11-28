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
	groups.GET(fmt.Sprintf("/daemon/:%s", types.DAEMON_ID_PARAM), getByDaemon, middleware.WithAdmin)

	{
		group := groups.Group(fmt.Sprintf("/:%s", types.GROUP_ID_PARAM))
		group.Use(middleware.WithGroup)

		group.GET("", getByID)
		group.DELETE("", deleteByID, middleware.WithAdmin)
		group.POST("/updateuser/:username/:status", updateUser)

		{
			// Compose requests
			compose := group.Group("/compose")
			compose.POST(fmt.Sprintf("/create/:%s", types.SUBSERVICE_ID_PARAM), createServiceGroup, middleware.WithGroupAdmin)
			compose.GET(fmt.Sprintf("/status/:%s", types.GROUPSERVICE_NAME_PARAM), getServiceGroupStatus)
			compose.POST(fmt.Sprintf("/status/:%s", types.GROUPSERVICE_NAME_PARAM), updateServiceGroupStatus)
		}

		{
			services := group.Group("/services", middleware.WithAdmin)
			services.POST(fmt.Sprintf("/:%s", types.GROUPSERVICE_NAME_PARAM), saveGroupService)
			services.GET(fmt.Sprintf("/:%s/update", types.GROUPSERVICE_NAME_PARAM), getGroupServiceUpdate)
			services.POST(fmt.Sprintf("/:%s/update", types.GROUPSERVICE_NAME_PARAM), updateGroupService)
		}

		{
			// Docker requests
			docker := group.Group("/docker/containers")
			docker.GET("", getContainers)
			docker.POST("", saveContainers)
			docker.GET("/transform", transformServices)
		}

		{
			// CAdvisor requests
			cadvisor := group.Group("/cadvisor")
			cadvisor.GET("", getCAdvisorInfo)
		}
	}
}
