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
	groups.POST("", save)

	{
		group := groups.Group(fmt.Sprintf("/:%s", types.GROUP_ID_PARAM))
		group.Use(middleware.WithGroup)

		group.GET("", getByID)
		group.DELETE("", deleteByID, middleware.WithAdmin)
		group.POST("/updateuser/:username/:status", updateUser)

		{
			group.POST("/compose/start/:subserviceID", startSubService)
			group.POST("/compose/create/:subserviceID", createSubService)
		}

		{
			group.GET("/docker/containers", getContainers)
			group.POST("/docker/containers", saveContainers)
			group.POST(fmt.Sprintf("/docker/containers/create/:%s", types.CONTAINER_ID_PARAM), createContainer)
		}

		{
			group.GET("/cadvisor/container", getCAdvisorContainerInfo)
		}
	}
}
