package services

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"sync"

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

	// To run multiple get variables at the same time
	var wg sync.WaitGroup

	for i := 0; i < len(s); i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			s[i].GetVariablesOfSubServices()
		}(i)
	}
	wg.Wait()

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

func validateTemplate(c echo.Context) error {

	template, err := ioutil.ReadAll(c.Request().Body)

	daemon := types.Daemon{
		DaemonLight: types.DaemonLight{
			Name: "testdaemon",
			Host: "testdaemon.renn.fr.ssg",
		},
		Docker: types.Docker{
			Volume: "/data",
		},
	}

	group := types.Group{
		GroupLight: types.GroupLight{
			Name: "TEST_PROJECT",
		},
	}

	service := types.SubService{
		Name:      "Test Service",
		File:      string(template),
		Variables: []types.ServiceVariable{},
	}

	gs, err := service.ConvertToGroupService("ServiceTest", daemon, group, false)
	if err != nil {
		return c.JSON(http.StatusBadRequest, fmt.Sprintf("Failed to convert to group service: %s", err))
	}

	return c.String(http.StatusOK, string(gs.File))
}
