package users

import (
	"net/http"

	"docktor/server/storage"
	"docktor/server/types"

	"github.com/labstack/echo/v4"
	log "github.com/sirupsen/logrus"
)

// getAll find all
func getAll(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)
	s, err := db.Users().FindAllWithGroups()
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when retrieving users")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// getByUsername find one by name
func getByUsername(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)
	user, err := db.Users().FindByUsername(c.Param(types.USERNAME_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"username": c.Param(types.USERNAME_PARAM),
			"error":    err,
		}).Error("Error when retrieving user")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	groups, err := db.Groups().FindByUser(user)
	if err != nil {
		log.WithError(err).WithField("username", user.Username).Error("When retrieve groups for profile")
	}
	return c.JSON(http.StatusOK, types.Profile{UserLight: user.UserLight, GroupsLight: groups})
}

// save a User server
func save(c echo.Context) error {
	// TODO update only yours
	var u types.User
	err := c.Bind(&u)
	if err != nil {
		log.WithFields(log.Fields{
			"body":  c.Request().Body,
			"error": err,
		}).Error("Error when parsing user")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	db := c.Get("DB").(*storage.Docktor)
	u, err = db.Users().Save(u)
	if err != nil {
		log.WithFields(log.Fields{
			"user":  u,
			"error": err,
		}).Error("Error when saving/creating user")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, u)
}

// deleteByUsername delete one by username
func deleteByUsername(c echo.Context) error {
	// TODO also delete user in all groups
	db := c.Get("DB").(*storage.Docktor)
	err := db.Users().Delete(c.Param(types.USERNAME_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"username": c.Param(types.USERNAME_PARAM),
			"error":    err,
		}).Error("Error when deleting user")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, "ok")
}
