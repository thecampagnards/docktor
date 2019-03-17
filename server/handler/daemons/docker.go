package daemons

import (
	"encoding/binary"
	"io"
	"net/http"
	"strings"

	"docktor/server/dao"
	"docktor/server/types"
	"docktor/server/utils"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
	"golang.org/x/net/websocket"
)

// getContainers get containers from daemon
func getContainers(c echo.Context) error {

	daemon, err := dao.GetDaemonByID(c.Param(types.DAEMON_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	log.WithFields(log.Fields{
		"daemon": daemon,
	}).Info("Daemon retrieved")

	cs, err := utils.GetContainers(daemon)
	if err != nil {
		log.WithFields(log.Fields{
			"daemon": daemon,
			"error":  err,
		}).Error("Error when retrieving daemon conatiners")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	log.WithFields(log.Fields{
		"containers": cs,
	}).Info("Daemon containers retrieved")

	return c.JSON(http.StatusOK, cs)
}

// updateContainersStatus change the status of caontiners param split by ','
func updateContainersStatus(c echo.Context) error {

	daemon, err := dao.GetDaemonByID(c.Param(types.DAEMON_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving daemon")
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
		log.WithFields(log.Fields{
			"daemon": daemon,
			"status": c.QueryParam("status"),
			"error":  "Wrong status",
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, "Wrong status")
	}

	if err != nil {
		log.WithFields(log.Fields{
			"daemon":     daemon,
			"status":     c.QueryParam("status"),
			"containers": containers,
			"error":      err,
		}).Error("Error when changing containers status")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, c.QueryParam("status"))
}

// getContainerLog is a ws which send container log
func getContainerLog(c echo.Context) error {
	websocket.Handler(func(ws *websocket.Conn) {
		defer ws.Close()

		daemon, err := dao.GetDaemonByID(c.Param(types.DAEMON_ID_PARAM))
		if err != nil {
			log.WithFields(log.Fields{
				"daemonID": c.Param(types.DAEMON_ID_PARAM),
				"error":    err,
			}).Error("Error when retrieving daemon")
			return
		}

		reader, err := utils.GetContainerLogFollow(daemon, c.Param(types.CONTAINER_ID_PARAM))
		if err != nil {
			log.WithFields(log.Fields{
				"daemon":      daemon,
				"containerID": c.Param(types.CONTAINER_ID_PARAM),
				"error":       err,
			}).Error("Error when retrieving logs socket")
			return
		}

		defer reader.Close()

		// ignore the 8 first bytes
		hdr := make([]byte, 8)

		// https://stackoverflow.com/questions/46428721/how-to-stream-docker-container-logs-via-the-go-sdk
		for {
			_, err := reader.Read(hdr)
			if err != nil && err != io.EOF {
				log.WithFields(log.Fields{
					"daemon": daemon,
					"error":  err,
				}).Error("Error when reading 8 first bytes")
			}

			count := binary.BigEndian.Uint32(hdr[4:])
			dat := make([]byte, count)
			_, err = reader.Read(dat)
			if err != nil {
				log.WithFields(log.Fields{
					"daemon": daemon,
					"error":  err,
				}).Error("Error when reading")
				break
			}

			if err := websocket.Message.Send(ws, string(dat)); err != nil {
				log.Info("client close the connection")
				break
			}
		}
	}).ServeHTTP(c.Response(), c.Request())
	return nil
}

// getContainerTerm is a ws which provide an ssh term inside the container
// Based on https://github.com/bitbull-team/docker-exec-web-console
func getContainerTerm(c echo.Context) error {
	websocket.Handler(func(ws *websocket.Conn) {
		defer ws.Close()

		daemon, err := dao.GetDaemonByID(c.Param(types.DAEMON_ID_PARAM))
		if err != nil {
			log.WithFields(log.Fields{
				"daemonID": c.Param(types.DAEMON_ID_PARAM),
				"error":    err,
			}).Error("Error when retrieving daemon")
			return
		}

		log.WithFields(log.Fields{
			"daemon": daemon,
		}).Info("Daemon retrieved")

		hij, err := utils.GetContainerTerm(daemon, c.Param(types.CONTAINER_ID_PARAM))
		if err != nil {
			log.WithFields(log.Fields{
				"daemon":      daemon,
				"containerID": c.Param(types.CONTAINER_ID_PARAM),
				"error":       err,
			}).Error("Error when retrieving container term socket")
			return
		}

		log.Info("hij reponse connected")

		defer hij.Close()

		// redirect output to ws
		go func() (err error) {
			log.Info("redirect output to ws")
			if ws != nil {
				_, err = io.Copy(ws, hij.Reader)
			}
			return err
		}()

		// redirect ws input to input
		go func() error {
			log.Info("redirect input to ws")
			if ws != nil {
				io.Copy(hij.Conn, ws)
			}
			if conn, ok := hij.Conn.(interface {
				CloseWrite() error
			}); ok {
				log.Info("Close the connection")
				if err := conn.CloseWrite(); err != nil {
					log.WithFields(log.Fields{
						"daemon": daemon,
						"error":  err,
					}).Error("Error when closing container term socket")
				}
			}
			return nil
		}()

		log.Info("Ws ready !")

		// log errors
		var receiveStdout chan error
		if err := <-receiveStdout; err != nil {
			log.WithFields(log.Fields{
				"daemon": daemon,
				"error":  err,
			}).Error("Error in container term")
		}

	}).ServeHTTP(c.Response(), c.Request())
	return nil
}
