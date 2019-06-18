package groups

import (
	"errors"
	"net/http"
	"strconv"

	"docktor/server/storage"
	"docktor/server/types"

	"github.com/labstack/echo/v4"
	log "github.com/sirupsen/logrus"
)

// getAllWithDaemons find all groups with daemons
func getAllWithDaemons(c echo.Context) error {
	user := c.Get("user").(types.User)
	db := c.Get("DB").(*storage.Docktor)
	if all, _ := strconv.ParseBool(c.QueryParam("all")); all {
		groups, err := db.Groups().FindAllLight()
		if err != nil {
			log.WithFields(log.Fields{
				"error": err,
			}).Error("Error when retrieving groups")
			return c.JSON(http.StatusBadRequest, err.Error())
		}
		return c.JSON(http.StatusOK, groups)
	}
	groups, err := db.Groups().FindByUser(user)
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when retrieving groups")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, groups)
}

// getByID find one by id
func getByID(c echo.Context) error {
	return c.JSON(http.StatusOK, c.Get("group"))
}

// save a Group server
func save(c echo.Context) error {
	var g types.Group
	err := c.Bind(&g)
	if err != nil {
		log.WithFields(log.Fields{
			"body":  c.Request().Body,
			"error": err,
		}).Error("Error when parsing group")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	user := c.Get("user").(types.User)
	db := c.Get("DB").(*storage.Docktor)

	if !user.IsAdmin() {
		if !g.ID.Valid() {
			return echo.NewHTTPError(http.StatusForbidden, "Admin permission required")
		}

		group, err := db.Groups().FindByIDBson(g.ID)
		if err != nil {
			log.WithFields(log.Fields{
				"group": g,
				"error": err,
			}).Error("Error when finding group")
			return c.JSON(http.StatusBadRequest, err.Error())
		}
		if !group.IsAdmin(&user) {
			return echo.NewHTTPError(http.StatusForbidden, "Admin group permission required")
		}
	}

	g, err = db.Groups().Save(g)
	if err != nil {
		log.WithFields(log.Fields{
			"group": g,
			"error": err,
		}).Error("Error when updating/creating group")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, g)
}

// deleteByID delete one by id
func deleteByID(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)

	group := c.Get("group").(types.Group)
	err := db.Groups().Delete(group.ID.Hex())
	if err != nil {
		log.WithFields(log.Fields{
			"groupID": c.Param(types.GROUP_ID_PARAM),
			"error":   err,
		}).Error("Error when deleting group")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, "ok")
}

// updateUser updates the role of a user in the group or delete it
func updateUser(c echo.Context) error {
	group := c.Get("group").(types.Group)
	username := c.Param("username")

	switch c.Param("status") {
	case "admin":
		group.Users = types.Remove(group.Users, username)
		group.Admins = append(group.Admins, username)
	case "user":
		group.Admins = types.Remove(group.Admins, username)
		group.Users = append(group.Users, username)
	case "delete":
		group.Users = types.Remove(group.Users, username)
		group.Admins = types.Remove(group.Admins, username)
	default:
		return errors.New("Invalid status parameter")
	}

	db := c.Get("DB").(*storage.Docktor)
	group, err := db.Groups().Save(group)
	if err != nil {
		log.WithFields(log.Fields{
			"group": group,
			"error": err,
		}).Error("Error when updating/creating group")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, group)
}
