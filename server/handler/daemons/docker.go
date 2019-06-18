package daemons

import (
	"encoding/binary"
	"io"
	"net/http"
	"net/url"
	"strings"

	"docktor/server/storage"
	"docktor/server/types"

	"github.com/labstack/echo/v4"
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

// getSavedContainers get saved containers from group of a daemon
func getSavedContainers(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)
	cs, err := db.Groups().FindContainersByDaemonID(c.Param(types.DAEMON_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving groups containers of daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, cs)
}

// updateContainersStatus change the status of caontiners param split by ','
func updateContainersStatus(c echo.Context) error {

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

	var errs map[string]string

	switch c.QueryParam("status") {
	case "start":
		errs = daemon.StartContainers(containers...)
	case "stop":
		errs = daemon.StopContainers(containers...)
	case "remove":
		errs = daemon.RemoveContainers(containers...)
	case "create":

		// Find groups of daemon
		groups, err := db.Groups().FindByDaemonIDBson(daemon.ID)
		if err != nil {
			log.WithFields(log.Fields{
				"daemonID": daemon.ID,
				"error":    err,
			}).Error("Error when retrieving groups")
			return c.JSON(http.StatusBadRequest, err.Error())
		}

		errs = make(map[string]string)

		for _, group := range groups {
			for _, container := range group.FindContainersByNameOrID(containers) {
				err = daemon.CreateContainer(container)
				if err != nil {
					errs[container.Name] = err.Error()
					log.WithFields(log.Fields{
						"daemon":    daemon.Name,
						"status":    c.QueryParam("status"),
						"err":       err,
						"container": container,
					}).Error("Error when create this container")
				}
			}
		}
	default:
		log.WithFields(log.Fields{
			"daemon": daemon.Name,
			"status": c.QueryParam("status"),
			"error":  "Wrong status",
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, "Wrong status")
	}

	if len(errs) > 0 {
		log.WithFields(log.Fields{
			"daemon":     daemon.Name,
			"status":     c.QueryParam("status"),
			"containers": containers,
			"error":      err,
		}).Error("Error when changing containers status")
		return c.JSON(http.StatusBadRequest, errs)
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

	// Find the command
	command, err := db.Images().FindCommandByID(c.Param(types.COMMAND_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"commandID": c.Param(types.COMMAND_ID_PARAM),
			"error":     err,
		}).Error("Error when retrieving command")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	log.WithFields(log.Fields{
		"command": command.Title,
	}).Info("Command retrieved")

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

	// Apply the variables in the go template
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
	container, err := url.QueryUnescape(c.Param(types.CONTAINER_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"container": c.Param(types.CONTAINER_ID_PARAM),
			"error":     err,
		}).Error("Error when parsing container name")
		return c.JSON(http.StatusBadRequest, err)
	}

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

// getContainerLog is a ws which send container log
func getContainerLog(c echo.Context) error {
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

// getContainerTerm is a ws which provide an ssh term inside the container
// Based on https://github.com/bitbull-team/docker-exec-web-console
func getContainerTerm(c echo.Context) error {
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

		log.Info("hij response connected")

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
