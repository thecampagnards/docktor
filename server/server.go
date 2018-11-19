package main

import (
	"web-docker-manager/server/handler"

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

	daemon := api.Group("/daemons")
	daemon.GET("/:ID", Daemon.GetByID)
	daemon.DELETE("/:ID", Daemon.DeleteByID)
	daemon.GET("", Daemon.GetAll)
	daemon.POST("", Daemon.Save)

	// For service
	Service := handler.Service{}

	service := api.Group("/services")
	service.GET("/:ID", Service.GetByID)
	service.DELETE("/:ID", Service.DeleteByID)
	service.GET("", Service.GetAll)
	service.POST("", Service.Save)

	// For group
	Group := handler.Group{}

	group := api.Group("/groups")
	group.GET("/:ID", Group.GetByID)
	group.DELETE("/:ID", Group.DeleteByID)
	group.POST("/:ID/compose", Group.Compose)
	group.GET("/:ID/containers", Group.GetContainers)
	group.GET("", Group.GetAll)
	group.POST("", Group.Save)

	// For docker containers and more
	Docker := handler.Docker{}

	docker := api.Group("/docker")
	docker.GET("/:ID/containers", Docker.GetContainersByDaemon)

	e.Logger.Fatal(e.Start(":8080"))
}
