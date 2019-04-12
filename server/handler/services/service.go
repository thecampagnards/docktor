package services

import (
	"net/http"

	"docktor/server/dao"
	"docktor/server/types"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// getAll find all
func getAll(c echo.Context) error {
	s, err := dao.GetServices()
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	for i := 0; i < len(s); i++ {
		for j := 0; j < len(s[i].SubServices); j++ {
			err = s[i].SubServices[j].GetVariablesOfSubServices()
			if err != nil {
				log.WithFields(log.Fields{
					"subserviceId": s[i].SubServices[j].ID,
					"err":          err,
				}).Warn("Error when retrieving variables of subservice")
			}
			log.WithFields(log.Fields{
				"subservice": s[i].SubServices[j].Name,
				"variables":  s[i].SubServices[j].Variables,
			}).Info("Retrieving variables of subservice")
		}
	}
	return c.JSON(http.StatusOK, s)
}

// getByID find one by id
func getByID(c echo.Context) error {
	s, err := dao.GetServiceByID(c.Param(types.SERVICE_ID_PARAM))

	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	for index := 0; index < len(s.SubServices); index++ {
		s.SubServices[index].GetVariablesOfSubServices()
	}

	return c.JSON(http.StatusOK, s)
}

// getBySubServiceID find one by id
func getBySubServiceID(c echo.Context) error {
	s, err := dao.GetServiceBySubSeriveID(c.Param(types.SUBSERVICE_ID_PARAM))

	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// save a Service server
func save(c echo.Context) error {
	var u types.Service

	err := c.Bind(&u)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	s, err := dao.CreateOrUpdateService(u)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// deleteByID delete one by id
func deleteByID(c echo.Context) error {
	err := dao.DeleteService(c.Param("serviceID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, "ok")
}
