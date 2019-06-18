package daemons

import (
	"fmt"

	"docktor/server/middleware"
	"docktor/server/types"

	"github.com/labstack/echo/v4"
)

// AddRoute add route on echo
func AddRoute(e *echo.Group) {
	daemons := e.Group("/daemons")

	// Basic daemon request
	daemons.GET("", getAll)
	daemons.POST("", save, middleware.WithAdmin)

	{
		daemon := daemons.Group(fmt.Sprintf("/:%s", types.DAEMON_ID_PARAM))
		daemon.GET("", getByID)
		daemon.DELETE("", deleteByID, middleware.WithAdmin)
		{
			// Compose requests
			compose := daemon.Group("/compose")
			compose.Use(middleware.WithAdmin)
			compose.GET("/services", getComposeServices)
			compose.POST("/status", updateDaemonComposeStatus)
		}
		{
			// Docker requests
			docker := daemon.Group("/docker")
			docker.GET("/containers", getContainers, middleware.WithAdmin)
			docker.GET("/containers/saved", getSavedContainers, middleware.WithAdmin)
			docker.POST("/containers/status", updateContainersStatus)
			docker.GET(fmt.Sprintf("/containers/:%s/log", types.CONTAINER_ID_PARAM), getContainerLog, middleware.WithDaemonContainer)
			docker.GET(fmt.Sprintf("/containers/:%s/term", types.CONTAINER_ID_PARAM), getContainerTerm, middleware.WithDaemonContainer)
			docker.POST(fmt.Sprintf("/containers/:%s/exec/:%s", types.CONTAINER_ID_PARAM, types.COMMAND_ID_PARAM), execContainer, middleware.WithDaemonContainer)
		}
		{
			// SSH requests
			ssh := daemon.Group("/ssh")
			ssh.Use(middleware.WithAdmin)
			ssh.GET("/term", getSSHTerm)
			ssh.POST("/exec", execSSH)
		}
		{
			// CAdvisor requests
			cadvisor := daemon.Group("/cadvisor")
			cadvisor.Use(middleware.WithAdmin)
			cadvisor.GET("", getCAdvisorInfo)
		}
	}
}
