package groups

import (
	"errors"
	"net/http"
	"strconv"

	"docktor/server/dao"
	"docktor/server/types"
	"docktor/server/utils"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// getAllWithDaemons find all groups with daemons
func getAllWithDaemons(c echo.Context) error {
	user := c.Get("user").(types.UserRest)
	if all, _ := strconv.ParseBool(c.QueryParam("all")); all {
		groups, err := dao.GetGroupsRest()
		if err != nil {
			log.WithFields(log.Fields{
				"error": err,
			}).Error("Error when retrieving groups with daemons")
			return c.JSON(http.StatusBadRequest, err.Error())
		}
		return c.JSON(http.StatusOK, groups)
	}
	return c.JSON(http.StatusOK, user.GroupsData)
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

	// user := c.Get("user").(types.UserRest)
	// if !user.IsMyGroup(g) {
	//	return echo.NewHTTPError(http.StatusForbidden, "Group permission required")
	//}

	s, err := dao.CreateOrUpdateGroup(g, true)
	if err != nil {
		log.WithFields(log.Fields{
			"group": g,
			"error": err,
		}).Error("Error when updating/creating group")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// deleteByID delete one by id
func deleteByID(c echo.Context) error {
	err := dao.DeleteGroup(c.Param(types.GROUP_ID_PARAM))
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
		group.Users = utils.Remove(group.Users, username)
		group.Admins = append(group.Admins, username)
	case "user":
		group.Admins = utils.Remove(group.Admins, username)
		group.Users = append(group.Users, username)
	case "delete":
		group.Users = utils.Remove(group.Users, username)
		group.Admins = utils.Remove(group.Admins, username)
	default:
		return errors.New("Invalid status parameter")
	}

	s, err := dao.CreateOrUpdateGroup(group, false)
	if err != nil {
		log.WithFields(log.Fields{
			"group": group,
			"error": err,
		}).Error("Error when updating/creating group")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}
