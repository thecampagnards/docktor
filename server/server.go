package main

import (
	"docktor/server/handler"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

func main() {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	api := e.Group("/api")

	// For daemon
	Daemon := handler.Daemon{}
	Group := handler.Group{}
	Compose := handler.Compose{}
	Service := handler.Service{}

	daemon := api.Group("/daemons")
	daemon.GET("/:daemonID/log/:containerID", Daemon.GetContainerLog)
	daemon.POST("/:daemonID/containers/status", Daemon.StatusContainers)
	daemon.GET("/:daemonID/containers", Daemon.GetContainers)
	daemon.GET("/:daemonID/cadvisor/machine", Daemon.GetCAdvisorMachineInfo)
	daemon.GET("/:daemonID/cadvisor/container", Daemon.GetCAdvisorContainerInfo)
	daemon.GET("/:daemonID", Daemon.GetByID)
	daemon.DELETE("/:daemonID", Daemon.DeleteByID)
	daemon.GET("", Daemon.GetAll)
	daemon.POST("", Daemon.Save)

	// For service
	service := api.Group("/services")
	service.GET("/subservice/:subserviceID", Service.GetBySubServiceID)
	service.GET("/:serviceID", Service.GetByID)
	service.DELETE("/:serviceID", Service.DeleteByID)
	service.GET("", Service.GetAll)
	service.POST("", Service.Save)

	// For group

	group := api.Group("/groups")
	group.GET("/:groupID", Group.GetByID)
	group.DELETE("/:groupID", Group.DeleteByID)
	group.POST("/:groupID/start/:subserviceID", Compose.StartSubService)
	group.GET("/:groupID/containers", Group.GetContainers)
	group.GET("", Group.GetAll)
	group.POST("", Group.Save)

	e.Static("/", "client")

	e.Logger.Fatal(e.Start(":8080"))
}
