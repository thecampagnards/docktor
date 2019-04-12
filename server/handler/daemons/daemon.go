package daemons

import (
	"crypto/x509"
	"net/http"
	"strings"
	"time"

	"docktor/server/dao"
	"docktor/server/types"
	"docktor/server/utils"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// getAll find all daemons
func getAll(c echo.Context) error {
	s, err := dao.GetDaemons()
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when retrieving daemons")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	// TODO clean data when not admin
	return c.JSON(http.StatusOK, s)
}

// getByID find one daemon by id
func getByID(c echo.Context) error {
	s, err := dao.GetDaemonByID(c.Param(types.DAEMON_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when retrieving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	// TODO clean data when not admin
	return c.JSON(http.StatusOK, s)
}

// checkDaemonStatus updates the status of a daemon
func checkDaemonStatus(daemonID string) error {
	d, err := dao.GetDaemonByID(daemonID)
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": daemonID,
			"error":    err,
		}).Error("Error when retrieving daemon")
		return err
	}

	status := types.STATUS_OK

	_, err = utils.GetDockerInfo(d)
	if err == nil {
		// check cert expiration date
		ca, err := x509.ParseCertificate([]byte(d.Docker.Ca))
		if err != nil {
			log.WithFields(log.Fields{
				"daemon": d,
				"error":  err,
			}).Error("Error while parsing ca.crt")
		}
		if time.Until(ca.NotAfter) < time.Hour*168 {
			status = types.STATUS_CERT
		}
	} else {
		msg := err.Error()
		if strings.Contains(msg, "client is newer than server") {
			status = types.STATUS_OLD
		} else {
			status = types.STATUS_DOWN
		}
	}

	if status != d.Docker.Status {
		_, err = dao.CreateOrUpdateDaemon(d)
		if err != nil {
			log.WithFields(log.Fields{
				"daemon": d,
				"error":  err,
			}).Error("Error when updating daemon status")
			return err
		}
	}

	return nil
}

// save create/update a daemon
func save(c echo.Context) error {
	var u types.Daemon
	err := c.Bind(&u)
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when saving daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	s, err := dao.CreateOrUpdateDaemon(u)
	if err != nil {
		log.WithFields(log.Fields{
			"daemon": u,
			"error":  err,
		}).Error("Error when creating/updating daemons")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// deleteByID delete one daemon by id
func deleteByID(c echo.Context) error {
	err := dao.DeleteDaemon(c.Param(types.DAEMON_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"daemonID": c.Param(types.DAEMON_ID_PARAM),
			"error":    err,
		}).Error("Error when deleting daemon")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, "ok")
}
