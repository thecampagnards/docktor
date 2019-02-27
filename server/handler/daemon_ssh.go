package handler

import (
	"docktor/server/dao"
	"docktor/server/utils"
	"io"
	"net/http"

	"github.com/labstack/echo"
	"golang.org/x/crypto/ssh"
	"golang.org/x/net/websocket"
)

// ExecSSHCommands execute comand on host
func (st *Daemon) ExecSSHCommands(c echo.Context) error {
	daemon, err := dao.GetDaemonByID(c.Param("daemonID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	var commands []string
	if err := c.Bind(&commands); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	result, err := utils.ExecSSH(daemon, commands...)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, result)
}

// RunSSHCommands is a ws which exec cmd on host
// Based on https://gist.github.com/josephspurrier/e83bcdbf9e6865500004
func (st *Daemon) RunSSHCommands(c echo.Context) error {
	websocket.Handler(func(ws *websocket.Conn) {

		defer ws.Close()

		daemon, err := dao.GetDaemonByID(c.Param("daemonID"))
		if err != nil {
			panic(err)
		}

		client, session, err := utils.GetSSHSession(daemon)
		if err != nil {
			panic(err)
		}

		defer client.Close()
		defer session.Close()

		modes := ssh.TerminalModes{}

		if err := session.RequestPty("xterm", 40, 80, modes); err != nil {
			c.Logger().Errorf("request for pseudo terminal failed: %s", err)
		}

		targetStdout, _ := session.StdoutPipe()
		targetStderr, _ := session.StderrPipe()
		targetStdin, _ := session.StdinPipe()

		if err := session.Shell(); err != nil {
			panic(err)
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
