package groups

import (
	"net/http"

	"docktor/server/dao"
	"docktor/server/types"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// getAllWithDaemons find all groups with daemons
func getAllWithDaemons(c echo.Context) error {
	user := c.Get("user").(types.User)
	if user.IsAdmin() {
		groups, err := dao.GetGroupsWithDaemons()
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
	s, err := dao.GetGroupByID(c.Param(types.GROUP_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"groupID": c.Param(types.GROUP_ID_PARAM),
			"error":   err,
		}).Error("Error when retrieving group")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// save a Group server
func save(c echo.Context) error {
	var u types.Group
	err := c.Bind(&u)
	if err != nil {
		log.WithFields(log.Fields{
			"body":  c.Request().Body,
			"error": err,
		}).Error("Error when parsing group")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	s, err := dao.CreateOrUpdateGroup(u)
	if err != nil {
		log.WithFields(log.Fields{
			"group": u,
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
