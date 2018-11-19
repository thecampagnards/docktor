package handler

import (
	"net/http"

	"web-docker-manager/server/dao"
	"web-docker-manager/server/types"

	"github.com/labstack/echo"
)

// Group struct which contains the functions of this class
type Group struct {
}

// GetAll find all
func (st *Group) GetAll(c echo.Context) error {
	s, err := dao.GetGroups()
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// GetByID find one by id
func (st *Group) GetByID(c echo.Context) error {
	s, err := dao.GetGroupByID(c.Param("ID"))

	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// Save a Group server
func (st *Group) Save(c echo.Context) error {
	var u types.Group
	err := c.Bind(&u)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	s, err := dao.CreateGroup(u)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// DeleteByID delete one by id
func (st *Group) DeleteByID(c echo.Context) error {
	err := dao.DeleteGroup(c.Param(":ID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, "ok")
}
