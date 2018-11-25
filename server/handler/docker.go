package handler

import (
	"docktor/server/dao"
	"docktor/server/utils"
	"encoding/binary"

	"net/http"

	"github.com/labstack/echo"
	"golang.org/x/net/websocket"
)

// Docker struct which contains the functions of this class
type Docker struct {
}

// GetContainersByDaemon get containers info by daemon
func (d *Docker) GetContainersByDaemon(c echo.Context) error {

	daemon, err := dao.GetDaemonByID(c.Param("ID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	cs, err := utils.GetContainers(daemon)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, cs)
}

// GetContainerLog is a ws which send container log
func (d *Docker) GetContainerLog(c echo.Context) error {
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
