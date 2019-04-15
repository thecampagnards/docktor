package jobs

import (
	"docktor/server/dao"
	"docktor/server/handler/daemons"

	"github.com/robfig/cron"
	log "github.com/sirupsen/logrus"
)

// RunBackgroundJobs manages cron executions
func RunBackgroundJobs(spec string) {

	c := cron.New()
	c.AddFunc(spec, CheckDaemonsStatuses)
	c.Start()
}

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
		daemons.CheckDaemonStatus(d)
	}
}
