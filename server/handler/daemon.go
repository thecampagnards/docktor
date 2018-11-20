package handler

import (
	"net/http"

	"docktor/server/dao"
	"docktor/server/types"

	"github.com/labstack/echo"
)

// Daemon struct which contains the functions of this class
type Daemon struct {
}

// GetAll find all
func (st *Daemon) GetAll(c echo.Context) error {
	s, err := dao.GetDaemons()
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// GetByID find one by id
func (st *Daemon) GetByID(c echo.Context) error {
	s, err := dao.GetDaemonByID(c.Param("ID"))

	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// Save a Daemon server
func (st *Daemon) Save(c echo.Context) error {
	var u types.Daemon
	err := c.Bind(&u)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	s, err := dao.CreateDaemon(u)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// DeleteByID delete one by id
func (st *Daemon) DeleteByID(c echo.Context) error {
	err := dao.DeleteDaemon(c.Param(":ID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, "ok")
}
