package daemons

import (
	"encoding/binary"
	"io"
	"net/http"
	"net/url"
	"strings"

	"docktor/server/storage"
	"docktor/server/types"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
	"golang.org/x/net/websocket"
)

// getContainers get containers from daemon
func getContainers(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)
	daemon, err := db.Daemons().FindByID(c.Param(types.DAEMON_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	log.WithFields(log.Fields{
		"daemon": daemon.Name,
	}).Info("Daemon retrieved")

	cs, err := daemon.GetContainers()
	if err != nil {
		log.WithFields(log.Fields{
			"daemon": daemon.Name,
			"error":  err,
		}).Error("Error when retrieving daemon containers")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	log.Info("Daemon containers retrieved")

	return c.JSON(http.StatusOK, cs)
}

// UpdateContainersStatus change the status of caontiners param split by ','
func UpdateContainersStatus(c echo.Context) error {

	db := c.Get("DB").(*storage.Docktor)
	daemon, err := db.Daemons().FindByID(c.Param(types.DAEMON_ID_PARAM))
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
		err = daemon.StartContainers(containers...)
	case "stop":
		err = daemon.StopContainers(containers...)
	case "remove":
		err = daemon.RemoveContainers(containers...)
	default:
		log.WithFields(log.Fields{
			"daemon": daemon.Name,
			"status": c.QueryParam("status"),
			"error":  "Wrong status",
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, "Wrong status")
	}

	if err != nil {
		log.WithFields(log.Fields{
			"daemon":     daemon.Name,
			"status":     c.QueryParam("status"),
			"containers": containers,
			"error":      err,
		}).Error("Error when changing containers status")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, c.QueryParam("status"))
}

// execContainer exec commands in container from daemon
func execContainer(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)
	// Find the daemon
	daemon, err := db.Daemons().FindByID(c.Param(types.DAEMON_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	log.WithFields(log.Fields{
		"daemon": daemon.Name,
	}).Info("Daemon retrieved")

	// Find the image
	image, err := db.Images().FindByID(c.Param(types.IMAGE_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"imageID": c.Param(types.IMAGE_ID_PARAM),
			"error":   err,
		}).Error("Error when retrieving image")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	log.WithFields(log.Fields{
		"image": image.Image.Pattern,
	}).Info("Image retrieved")

	// Unescape the command title
	title, err := url.QueryUnescape(c.Param(types.COMMAND_TITLE_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"commandTitle": c.Param(types.COMMAND_TITLE_PARAM),
			"error":        err,
		}).Error("Unable to decode command title")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	log.WithFields(log.Fields{
		"title": title,
	}).Info("Command unsecaped")

	// Find the command in the commands image
	var command types.Command
	for _, c := range image.Commands {
		if c.Title == title {
			command = c
			break
		}
	}

	if command.Title == "" {
		log.WithFields(log.Fields{
			"commandTitle": title,
			"error":        err,
		}).Error("Cannot find the command")
		return c.JSON(http.StatusBadRequest, "Cannot find the command")
	}

	log.WithFields(log.Fields{
		"command": command.Title,
	}).Info("Command found")

	// Get the body variables ton replace in the go template
	var variables interface{}
	err = c.Bind(&variables)
	if err != nil {
		log.WithFields(log.Fields{
			"variables": c.Request().Body,
			"error":     err,
		}).Error("Error when parsing variables")
		return c.JSON(http.StatusBadRequest, err)
	}

	log.WithFields(log.Fields{
		"variables": variables,
	}).Info("Variables parsed")

	// Apply the varaibles in the go template
	cmd, err := command.SetVariables(variables)
	if err != nil {
		log.WithFields(log.Fields{
			"variables": variables,
			"command":   command.Command,
			"error":     err,
		}).Error("Error when replacing variables")
		return c.JSON(http.StatusBadRequest, err)
	}

	// Get the container name
	container := c.Param(types.CONTAINER_ID_PARAM)

	// Launch the cmd
	logs, err := daemon.ExecContainer(container, []string{cmd})
	if err != nil {
		log.WithFields(log.Fields{
			"container": container,
			"commands":  cmd,
			"daemon":    daemon.Name,
			"error":     err,
		}).Error("Error when executing commands on containers")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, string(logs))
}

// GetContainerLog is a ws which send container log
func GetContainerLog(c echo.Context) error {
	websocket.Handler(func(ws *websocket.Conn) {
		defer ws.Close()

		db := c.Get("DB").(*storage.Docktor)
		daemon, err := db.Daemons().FindByID(c.Param(types.DAEMON_ID_PARAM))
		if err != nil {
			log.WithFields(log.Fields{
				"daemonID": c.Param(types.DAEMON_ID_PARAM),
				"error":    err,
			}).Error("Error when retrieving daemon")
			return
		}

		reader, err := daemon.GetContainerLogFollow(c.Param(types.CONTAINER_ID_PARAM))
		if err != nil {
			log.WithFields(log.Fields{
				"daemon":      daemon.Name,
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
					"daemon": daemon.Name,
					"error":  err,
				}).Error("Error when reading 8 first bytes")
			}

			count := binary.BigEndian.Uint32(hdr[4:])
			dat := make([]byte, count)
			_, err = reader.Read(dat)
			if err != nil {
				log.WithFields(log.Fields{
					"daemon": daemon.Name,
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

// GetContainerTerm is a ws which provide an ssh term inside the container
// Based on https://github.com/bitbull-team/docker-exec-web-console
func GetContainerTerm(c echo.Context) error {
	websocket.Handler(func(ws *websocket.Conn) {
		defer ws.Close()

		db := c.Get("DB").(*storage.Docktor)
		daemon, err := db.Daemons().FindByID(c.Param(types.DAEMON_ID_PARAM))
		if err != nil {
			log.WithFields(log.Fields{
				"daemonID": c.Param(types.DAEMON_ID_PARAM),
				"error":    err,
			}).Error("Error when retrieving daemon")
			return
		}

		log.WithFields(log.Fields{
			"daemon": daemon.Name,
		}).Info("Daemon retrieved")

		hij, err := daemon.GetContainerTerm(c.Param(types.CONTAINER_ID_PARAM))
		if err != nil {
			log.WithFields(log.Fields{
				"daemon":      daemon.Name,
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
						"daemon": daemon.Name,
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
				"daemon": daemon.Name,
				"error":  err,
			}).Error("Error in container term")
		}

	}).ServeHTTP(c.Response(), c.Request())
	return nil
}
