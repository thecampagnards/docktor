package jobs

import (
	"crypto/x509"
	"docktor/server/dao"
	"docktor/server/types"
	"docktor/server/utils"
	"encoding/pem"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"
)

// CheckDaemonsStatuses updates the status of each daemon in the db
func CheckDaemonsStatuses() {
	log.Info("Checking daemons status...")

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

	log.Info("Daemons status check done.")
}

// checkDaemonStatus updates the status of a daemon
func checkDaemonStatus(d types.Daemon) {
	log.Debugf("Checking daemon status - %s", d.Name)
	status := types.STATUS_OK

	_, err := utils.GetDockerInfo(d)
	if err == nil {
		if d.Docker.Ca != "" {
			// check cert expiration date
			block, _ := pem.Decode([]byte(d.Docker.Ca))
			ca, err := x509.ParseCertificate(block.Bytes)
			if err != nil {
				log.WithFields(log.Fields{
					"daemon": d,
					"error":  err,
				}).Error("Error while parsing ca.crt")
			}
			if time.Until(ca.NotAfter) < time.Hour*168 {
				status = types.STATUS_CERT
			}
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
		d.Docker.Status = status
		_, err = dao.CreateOrUpdateDaemon(d)
		if err != nil {
			log.WithFields(log.Fields{
				"daemon": d,
				"error":  err,
			}).Error("Error when updating daemon status")
		}
	}
}
