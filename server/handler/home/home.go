package home

import (
	"docktor/server/storage"
	"docktor/server/types"
	"net/http"

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

	for _, group := range g {
		env := types.Environment{
			Group: group.GroupLight,
		}

		d, err := db.Daemons().FindByID(group.Daemon.Hex())
		if err != nil {
			log.WithError(err).WithField("daemonId", group.Daemon.Hex()).Error("Error while retreiving daemon by ID")
			return c.JSON(http.StatusInternalServerError, err.Error())
		}

		env.Daemon = d.DaemonLight

		env.Resources, err = d.CAdvisorInfoFilterFs(group.Name)
		if err != nil {
			log.WithError(err).WithField("daemon", d.Name).Error("Error while getting machine infos")
			return c.JSON(http.StatusInternalServerError, err.Error())
		}

		env.Containers, err = d.GetContainersStartByName(group.Name)
		if err != nil {
			log.WithError(err).WithField("daemon", d.Name).Error("Error while getting containers status")
			return c.JSON(http.StatusInternalServerError, err.Error())
		}

		response.Environments = append(response.Environments, env)
	}

	return c.JSON(http.StatusOK, response)
}
