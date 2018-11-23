package main

import (
	"context"
	"docktor/server/handler"
	"docktor/server/types"
	"docktor/server/utils"
	"fmt"
	"io/ioutil"

	"golang.org/x/net/websocket"

	dockerTypes "github.com/docker/docker/api/types"
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

	group.GET("/:ID/containers", Docker.GetGroupContainers)

	// For docker containers and more

	docker := api.Group("/docker")
	docker.GET("/:ID/containers", Docker.GetContainers)

	e.GET("/ws", hello)
	e.Static("/", "index.html")

	e.Logger.Fatal(e.Start(":8080"))
}

func hello(c echo.Context) error {
	websocket.Handler(func(ws *websocket.Conn) {
		defer ws.Close()
		for {
			// Write

			daemon := types.Daemon{Host: "localhost", Port: 2376}

			cli, err := utils.GetDockerCli(daemon)

			if err != nil {
				c.Logger().Error(err)
			}

			c, err := cli.ContainerLogs(context.Background(), "17260cd3f9b2", dockerTypes.ContainerLogsOptions{ShowStdout: true, ShowStderr: true})

			if err != nil {
			}

			defer c.Close()

			p, err := ioutil.ReadAll(c)

			// p, err := ioutil.ReadAll(c)

			// cop := string(p)

			err = websocket.Message.Send(ws, string(p))
			if err != nil {
			}

			// Read
			msg := ""
			err = websocket.Message.Receive(ws, &msg)
			if err != nil {
			}
			fmt.Printf("%s\n", msg)
		}
	}).ServeHTTP(c.Response(), c.Request())
	return nil
}
