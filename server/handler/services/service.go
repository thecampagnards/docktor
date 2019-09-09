package services

import (
	"net/http"

	"docktor/server/storage"
	"docktor/server/types"

	"github.com/labstack/echo/v4"
)

// getAll find all
func getAll(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)

	s, err := db.Services().FindAll()
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	for i := 0; i < len(s); i++ {
		s[i].GetVariablesOfSubServices()
	}
	return c.JSON(http.StatusOK, s)
}

// getByID find one by id
func getByID(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)

	s, err := db.Services().FindByID(c.Param(types.SERVICE_ID_PARAM))

	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, s)
}

// getBySubServiceID find one by id
func getBySubServiceID(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)

	s, err := db.Services().FindBySubServiceID(c.Param(types.SUBSERVICE_ID_PARAM))

	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	s.GetVariablesOfSubServices()

	return c.JSON(http.StatusOK, s)
}

// save a Service server
func save(c echo.Context) error {
	var u types.Service

	err := c.Bind(&u)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	db := c.Get("DB").(*storage.Docktor)

	u, err = db.Services().Save(u)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, u)
}

// deleteByID delete one by id
func deleteByID(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)
	err := db.Services().Delete(c.Param(types.SERVICE_ID_PARAM))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, "ok")
}
