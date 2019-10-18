package daemons

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"docktor/server/storage"
	"docktor/server/types"

	"github.com/labstack/echo/v4"
	log "github.com/sirupsen/logrus"
)

// getComposeServices this function return the compose files
func getComposeServices(c echo.Context) error {
	var files []string

	dir, err := os.Getwd()
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when retrieving workdir")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	assetDir := fmt.Sprintf("%s/assets/", dir)
	filepath.Walk(assetDir, func(path string, info os.FileInfo, err error) error {

		if err != nil {
			log.WithFields(log.Fields{
				"error": err,
			}).Errorf("Error when getting %s", path)
		}

		if info.IsDir() {
			return nil
		}

		log.WithFields(log.Fields{
			"path": path,
			"info": info,
		}).Info("Found file")

		if !strings.HasSuffix(info.Name(), "-compose.yml") {
			return nil
		}

		files = append(files, strings.TrimSuffix(strings.TrimPrefix(path, assetDir), "-compose.yml"))
		return nil
	})

	log.WithFields(log.Fields{
		"files": files,
	}).Info("Files found")

	return c.JSON(http.StatusOK, files)
}

func getDaemonComposeStatus(c echo.Context) error {

	db := c.Get("DB").(*storage.Docktor)
	daemon, err := db.Daemons().FindByID(c.Param(types.DAEMON_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	services, err := readServices(c.QueryParam("services"))
	if err != nil {
		log.WithFields(log.Fields{
			"daemon": daemon.Name,
			"error":  err,
		}).Error("Error when getting daemon services")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	info, err := daemon.ComposeStatus(types.PROJECT_NAME, services)
	if err != nil {
		log.WithFields(log.Fields{
			"daemonHost": daemon.Host,
			"services":   c.QueryParam("services"),
			"error":      err,
		}).Error("Error when compose info")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, info)
}

// updateDaemonComposeStatus this function run/stop/delete a daemon service (cadvisor, watchtower) via compose
// this service is in asset folder
func updateDaemonComposeStatus(c echo.Context) error {

	db := c.Get("DB").(*storage.Docktor)
	daemon, err := db.Daemons().FindByID(c.Param(types.DAEMON_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	services, err := readServices(c.QueryParam("services"))
	if err != nil {
		log.WithFields(log.Fields{
			"daemon": daemon.Name,
			"error":  err,
		}).Error("Error when getting daemon services")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	err = updateComposeStatus(types.PROJECT_NAME, daemon, c.QueryParam("status"), services...)
	if err != nil {
		log.WithFields(log.Fields{
			"daemon":   daemon,
			"services": services,
			"status":   c.QueryParam("status"),
			"error":    err,
		}).Error("Error when changing service status")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, c.QueryParam("status"))
}

func updateComposeStatus(project string, daemon types.Daemon, status string, services ...string) (err error) {
	switch status {
	case "start":
		err = daemon.ComposeUp(project, "", "", services)
	case "stop":
		err = daemon.ComposeStop(project, services)
	case "remove":
		err = daemon.ComposeRemove(project, services)
	default:
		err = errors.New("Wrong status")
	}
	return
}

func readServices(input string) ([]string, error) {
	dir, err := os.Getwd()
	if err != nil {
		return nil, err
	}

	splitFn := func(c rune) bool {
		return c == ','
	}

	services := strings.FieldsFunc(input, splitFn)
	for i := 0; i < len(services); i++ {
		services[i] = fmt.Sprintf("%s/assets/%s-compose.yml", dir, services[i])
	}

	return services, nil
}
