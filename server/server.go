package main

import (
	"docktor/server/handler"
	"docktor/server/types"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

func main() {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.Gzip())

	Auth := handler.Auth{}

	auth := e.Group("/auth")
	auth.POST("/login", Auth.Login)
	auth.POST("/register", Auth.Register)
	auth.POST("/reset_password", Auth.ResetPassword)              // Reset the forgotten password
	auth.POST("/change_reset_password", Auth.ChangeResetPassword) // Change password that has been reset

	api := e.Group("/api")

	config := middleware.JWTConfig{
		Claims:     &auth.MyCustomClaims{},
		SigningKey: []byte(os.Env("JWT_SECRET")),
		ContextKey: "user-token",
	}
	api.Use(middleware.JWTWithConfig(config)) // Enrich echo context with JWT
	api.Use(getAuhenticatedUser)

	Daemon := handler.Daemon{}
	Group := handler.Group{}
	Compose := handler.Compose{}
	Service := handler.Service{}

	daemon := api.Group("/daemons")
	daemon.GET("/:daemonID/log/:containerID", Daemon.GetContainerLog, hasRole(types.ADMIN_ROLE))
	daemon.GET("/:daemonID/commands/:containerID", Daemon.RunContainerCommands)
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
