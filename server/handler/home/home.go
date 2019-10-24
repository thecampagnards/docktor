package home

import (
	"net/http"
	"sync"

	"docktor/server/storage"
	"docktor/server/types"

	"github.com/labstack/echo/v4"
	log "github.com/sirupsen/logrus"
)

// getHomePage get the home page data
func getHomePage(c echo.Context) error {
	user := c.Get("user").(types.User)
	db := c.Get("DB").(*storage.Docktor)

	g, err := db.Groups().FindByUser(user)
	if err != nil {
		log.WithError(err).WithField("username", user.Username).Error("Error while retreiving groups for user")
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	response := types.HomePage{User: user.UserLight, Environments: []types.Environment{}}
	var wg sync.WaitGroup

	for _, group := range g {

		wg.Add(1)
		go func(group types.Group) {
			defer wg.Done()

			env := types.Environment{
				Group: group.GroupLight,
			}

			d, err := db.Daemons().FindByID(group.Daemon.Hex())
			if err != nil {
				log.WithError(err).WithField("daemonId", group.Daemon.Hex()).Error("Error while retreiving daemon by ID")
				return
			}

			env.Daemon = types.Daemon{
				DaemonLight: d.DaemonLight,
				Docker: types.Docker{
					Status: d.Docker.Status,
				},
			}

			var wggroup sync.WaitGroup

			wggroup.Add(1)
			go func() {
				defer wggroup.Done()

				env.Resources, err = d.CAdvisorInfoFilterFs(group.Name)
				if err != nil {
					log.WithError(err).WithField("daemon", d.Name).Error("Error while getting machine infos")
					return
				}
			}()

			wggroup.Add(1)
			go func() {
				defer wggroup.Done()

				env.Containers, err = d.GetContainersStartByName(group.Name)
				if err != nil {
					log.WithError(err).WithField("daemon", d.Name).Error("Error while getting containers status")
					return
				}
			}()

			wggroup.Wait()

			response.Environments = append(response.Environments, env)
		}(group)
	}

	wg.Wait()

	return c.JSON(http.StatusOK, response)
}
