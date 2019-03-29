package users

import (
	"net/http"

	"docktor/server/dao"
	"docktor/server/helper/ldap"
	"docktor/server/types"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// getAll find all
func getAll(c echo.Context) error {
	s, err := dao.GetUsersRest()
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
	s, err := dao.GetUserRestByUsername(c.Param(types.USERNAME_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"username": c.Param(types.USERNAME_PARAM),
			"error":    err,
		}).Error("Error when retrieving user")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// save a User server
func save(c echo.Context) error {
	var u types.User
	err := c.Bind(&u)
	if err != nil {
		log.WithFields(log.Fields{
			"body":  c.Request().Body,
			"error": err,
		}).Error("Error when parsing user")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	s, err := dao.CreateOrUpdateUser(u)
	if err != nil {
		log.WithFields(log.Fields{
			"user":  u,
			"error": err,
		}).Error("Error when saving/creating user")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// deleteByUsername delete one by username
func deleteByUsername(c echo.Context) error {
	// TODO also delete user in all groups
	err := dao.DeleteUser(c.Param(types.USERNAME_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"username": c.Param(types.USERNAME_PARAM),
			"error":    err,
		}).Error("Error when deleting user")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, "ok")
}

// setGlobalRole sets the role of a user to 'admin' or 'user'
func setGlobalRole(c echo.Context) error {

	user := types.User{
		Attributes: ldap.Attributes{
			Username: c.Param("username"),
		},
		Role: c.Param("role"),
	}

	s, err := dao.CreateOrUpdateUser(user)
	if err != nil {
		log.WithFields(log.Fields{
			"username": c.Param(types.USERNAME_PARAM),
			"error":    err,
		}).Error("Error when updating user's role")
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}
