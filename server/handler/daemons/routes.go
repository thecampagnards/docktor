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
		daemon.DELETE("", deleteByID)
		{
			// Compose requests
			compose := daemon.Group("/compose")
			compose.GET("/services", getComposeServices)
			compose.POST("/status", updateDaemonComposeStatus)
		}
		{
			// Docker requests
			docker := daemon.Group("/docker")
			docker.GET("/containers", getContainers)
			docker.POST("/containers/status", UpdateContainersStatus)
			docker.GET(fmt.Sprintf("/containers/:%s/log", types.CONTAINER_ID_PARAM), getContainerLog)
			docker.GET(fmt.Sprintf("/containers/:%s/term", types.CONTAINER_ID_PARAM), getContainerTerm)
			// docker.GET(fmt.Sprintf("/containers/:%s/exec", types.CONTAINER_ID_PARAM), execContainer)
		}
		{
			// SSH requests
			ssh := daemon.Group("/ssh")
			ssh.GET("/term", getSSHTerm)
			ssh.POST("/exec", execSSH)
		}
		{
			// CAdvisor requests
			cadvisor := daemon.Group("/cadvisor")
			cadvisor.GET("/machine", getCAdvisorMachineInfo)
			cadvisor.GET("/container", getCAdvisorContainerInfo)
		}
	}
}
