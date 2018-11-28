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
	Docker := handler.Docker{}
	Service := handler.Service{}

	daemon := api.Group("/daemons")
	daemon.GET("/:ID", Daemon.GetByID)
	daemon.DELETE("/:ID", Daemon.DeleteByID)
	daemon.GET("", Daemon.GetAll)
	daemon.POST("", Daemon.Save)

	// For service

	service := api.Group("/services")
	service.GET("/subservice/:ID", Service.GetBySubServiceID)
	service.GET("/:ID", Service.GetByID)
	service.DELETE("/:ID", Service.DeleteByID)
	service.GET("", Service.GetAll)
	service.POST("", Service.Save)

	// For group

	group := api.Group("/groups")
	group.GET("/:ID", Group.GetByID)
	group.DELETE("/:ID", Group.DeleteByID)
	group.POST("/:groupID/start/:subserviceID", Compose.StartSubService)
	group.GET("/:ID/containers", Group.GetContainers)
	group.GET("", Group.GetAll)
	group.POST("", Group.Save)

	// For docker containers and more

	docker := api.Group("/docker")
	docker.GET("/:daemonID/log/:containerID", Docker.GetContainerLog)
	docker.GET("/:ID/containers", Docker.GetContainers)

	e.Static("/", "index.html")

	e.Logger.Fatal(e.Start(":8080"))
}
