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
		group.POST("/updateuser/:username/:status", updateUser, middleware.WithGroupAdmin)

		{
			// Compose requests
			compose := group.Group("/compose")
			compose.POST("/start/:subserviceID", startSubService)
			compose.POST("/create/:subserviceID", createSubService)
		}

		{
			// Docker requests
			docker := group.Group("/docker/containers")
			docker.GET("", getContainers)
			docker.POST("", saveContainers)
			docker.POST("/status", updateContainersStatus)
			docker.POST(fmt.Sprintf("/:%s/create", types.CONTAINER_ID_PARAM), createContainer)
			docker.GET(fmt.Sprintf("/:%s/log", types.CONTAINER_ID_PARAM), getContainerLog)
			docker.GET(fmt.Sprintf("/:%s/term", types.CONTAINER_ID_PARAM), getContainerTerm, middleware.WithGroupAdmin)
		}

		{
			// CAdvisor requests
			cadvisor := group.Group("/cadvisor")
			cadvisor.GET("/machine", getCAdvisorMachineInfo)
			cadvisor.GET("/container", getCAdvisorContainerInfo)
		}
	}
}
