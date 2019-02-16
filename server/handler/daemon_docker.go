package handler

import (
	"encoding/binary"
	"io"
	"net/http"
	"strings"

	"docktor/server/dao"
	"docktor/server/utils"

	"github.com/labstack/echo"
	"golang.org/x/net/websocket"
)

// GetContainers get containers for daemon
func (st *Daemon) GetContainers(c echo.Context) error {

	daemon, err := dao.GetDaemonByID(c.Param("daemonID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	cs, err := utils.GetContainers(daemon)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, cs)
}

// StatusContainers change the status of a container slice
func (st *Daemon) StatusContainers(c echo.Context) error {

	daemon, err := dao.GetDaemonByID(c.Param("daemonID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	splitFn := func(c rune) bool {
		return c == ','
	}

	containers := strings.FieldsFunc(c.QueryParam("containers"), splitFn)

	switch c.QueryParam("status") {
	case "start":
		err = utils.StartContainers(daemon, containers...)
	case "stop":
		err = utils.StopContainers(daemon, containers...)
	case "remove":
		err = utils.RemoveContainers(daemon, containers...)
	default:
		return c.JSON(http.StatusBadRequest, "Wrong status")
	}

	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, "ok")
}

// GetContainerLog is a ws which send container log
func (st *Daemon) GetContainerLog(c echo.Context) error {
	websocket.Handler(func(ws *websocket.Conn) {
		defer ws.Close()

		daemon, err := dao.GetDaemonByID(c.Param("daemonID"))
		if err != nil {
			c.Logger().Error(err)
		}

		reader, err := utils.GetContainerLog(daemon, c.Param("containerID"))
		if err != nil {
			c.Logger().Error(err)
		}

		defer reader.Close()

		// ignore the 8 first bytes
		hdr := make([]byte, 8)

		// https://stackoverflow.com/questions/46428721/how-to-stream-docker-container-logs-via-the-go-sdk
		for {
			_, err := reader.Read(hdr)
			if err != nil {
				c.Logger().Error(err)
			}

			count := binary.BigEndian.Uint32(hdr[4:])
			dat := make([]byte, count)
			_, err = reader.Read(dat)
			if err != nil {
				c.Logger().Error(err)
			}

			websocket.Message.Send(ws, string(dat))
		}
	}).ServeHTTP(c.Response(), c.Request())
	return nil
}

// RunContainerCommands is a ws which exece cmd on container
// Based on https://github.com/bitbull-team/docker-exec-web-console
func (st *Daemon) RunContainerCommands(c echo.Context) error {
	websocket.Handler(func(ws *websocket.Conn) {

		defer ws.Close()

		daemon, err := dao.GetDaemonByID(c.Param("daemonID"))
		if err != nil {
			panic(err)
		}

		hij, err := utils.RunContainerCommands(daemon, c.Param("containerID"))
		if err != nil {
			panic(err)
		}

		defer hij.Close()

		// redirect output to ws
		go func() (err error) {
			if ws != nil {
				_, err = io.Copy(ws, hij.Reader)
			}
			return err
		}()

		// redirect ws input to input
		go func() error {
			if ws != nil {
				io.Copy(hij.Conn, ws)
			}
			if conn, ok := hij.Conn.(interface {
				CloseWrite() error
			}); ok {
				if err := conn.CloseWrite(); err != nil {
				}
			}
			return nil
		}()

		// log errors
		var receiveStdout chan error
		if err := <-receiveStdout; err != nil {
			c.Logger().Error(err)
		}

	}).ServeHTTP(c.Response(), c.Request())
	return nil
}
