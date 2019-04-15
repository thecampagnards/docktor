package jobs

import (
	"crypto/x509"
	"docktor/server/dao"
	"docktor/server/types"
	"docktor/server/utils"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"
)

// CheckDaemonsStatuses updates the status of each daemon in the db
func CheckDaemonsStatuses() {

	ds, err := dao.GetDaemons()
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when retrieving daemons")
		return
	}

	for _, d := range ds {
		checkDaemonStatus(d)
	}
}

// checkDaemonStatus updates the status of a daemon
func checkDaemonStatus(d types.Daemon) error {
	status := types.STATUS_OK

	_, err := utils.GetDockerInfo(d)
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
