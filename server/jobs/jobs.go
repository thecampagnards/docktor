package jobs

import (
	"github.com/robfig/cron"
)

// RunBackgroundJobs manages cron executions
func RunBackgroundJobs(spec string) {

	// Check status at server startup
	CheckDaemonsStatuses()

	c := cron.New()
	c.AddFunc(spec, CheckDaemonsStatuses)
	c.Start()
}
