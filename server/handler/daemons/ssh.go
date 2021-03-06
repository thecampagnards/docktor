package daemons

import (
	"io"
	"net/http"

	"docktor/server/storage"
	"docktor/server/types"

	"github.com/labstack/echo/v4"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/ssh"
	"golang.org/x/net/websocket"
)

// execSSH execute ssh commands on daemon
func execSSH(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)
	daemon, err := db.Daemons().FindByID(c.Param(types.DAEMON_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	var commands []string
	if err := c.Bind(&commands); err != nil {
		log.WithFields(log.Fields{
			"daemon": daemon.Name,
			"body":   c.Request().Body,
			"error":  err,
		}).Error("Error when parsing ssh commands")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	result, err := daemon.ExecSSH(commands...)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	log.WithFields(log.Fields{
		"result": result,
	}).Info("Results of commands")

	return c.JSON(http.StatusOK, result)
}

// getSSHTerm is a ws which create a ssh term on daemon
// Based on https://gist.github.com/josephspurrier/e83bcdbf9e6865500004
func getSSHTerm(c echo.Context) error {
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

		client, session, err := daemon.GetSSHSession()
		if err != nil {
			log.WithFields(log.Fields{
				"daemon": daemon.Name,
				"error":  err,
			}).Error("Error when retrieving ssh session")
			return
		}

		defer client.Close()
		defer session.Close()

		modes := ssh.TerminalModes{}

		if err := session.RequestPty("xterm", 40, 80, modes); err != nil {
			log.WithFields(log.Fields{
				"daemon": daemon.Name,
				"error":  err,
			}).Error("Error request for pseudo terminal failed")
			return
		}

		targetStdout, _ := session.StdoutPipe()
		targetStderr, _ := session.StderrPipe()
		targetStdin, _ := session.StdinPipe()

		if err := session.Shell(); err != nil {
			log.WithFields(log.Fields{
				"daemon": daemon.Name,
				"error":  err,
			}).Error("Error when opening shell session")
			return
		}

		// redirect output to ws
		go func() (err error) {
			if ws != nil {
				_, err = io.Copy(ws, targetStdout)
			}
			return err
		}()

		// redirect err output to ws
		go func() (err error) {
			if ws != nil {
				_, err = io.Copy(ws, targetStderr)
			}
			return err
		}()

		// redirect ws input to input
		go func() error {
			if ws != nil {
				io.Copy(targetStdin, ws)
			}
			if conn, ok := targetStdin.(interface {
				CloseWrite() error
			}); ok {
				if err := conn.CloseWrite(); err != nil {
					log.WithFields(log.Fields{
						"daemon": daemon.Name,
						"error":  err,
					}).Error("Error when closing shell session")
				}
			}
			return nil
		}()

		// log errors
		var receiveStdout chan error
		if err := <-receiveStdout; err != nil {
			log.WithFields(log.Fields{
				"daemon": daemon.Name,
				"error":  err,
			}).Error("Error in shell session")
		}

	}).ServeHTTP(c.Response(), c.Request())
	return nil
}
