package daemons

import (
	"fmt"

	"docktor/server/middleware"
	"docktor/server/types"

	"github.com/labstack/echo"
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
			docker.Use(middleware.WithAdmin)
			docker.GET("/containers", getContainers)
			docker.POST("/containers/status", UpdateContainersStatus)
			docker.GET(fmt.Sprintf("/containers/:%s/log", types.CONTAINER_ID_PARAM), GetContainerLog)
			docker.GET(fmt.Sprintf("/containers/:%s/term", types.CONTAINER_ID_PARAM), GetContainerTerm)
			docker.GET(fmt.Sprintf("/containers/:%s/exec", types.CONTAINER_ID_PARAM), execContainer)
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
			cadvisor.GET("/machine", GetCAdvisorMachineInfo)
			cadvisor.GET("/container", getCAdvisorContainerInfo)
		}
	}
}
