package jobs

import (
	"docktor/server/storage"

	log "github.com/sirupsen/logrus"
)

// CheckDaemonsStatuses updates the status of each daemon in the db
func CheckDaemonsStatuses() {
	log.Info("Checking daemons status...")

	dock, err := storage.Get()
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when connecting to the db")
		return
	}
	defer dock.Close()

	ds, err := dock.Daemons().FindAll()
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when retrieving daemons")
		return
	}

	for _, d := range ds {
		d.SetDockerStatus()
		log.Debugf("Daemon status - %s : %s", d.Name, d.Docker.Status)
		dock.Daemons().Save(d)
	}

	log.Info("Daemons status check done.")
}
