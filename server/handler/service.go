package handler

import (
	"encoding/json"
	"io/ioutil"
	"net/http"

	"docktor/server/dao"
	"docktor/server/types"

	"github.com/labstack/echo"
)

// Service struct which contains the functions of this class
type Service struct {
}

// GetAll find all
func (st *Service) GetAll(c echo.Context) error {
	s, err := dao.GetServices()
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// GetByID find one by id
func (st *Service) GetByID(c echo.Context) error {
	s, err := dao.GetServiceByID(c.Param("serviceID"))

	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	for index := 0; index < len(s.SubServices); index++ {
		s.SubServices[index].GetVariablesOfSubServices()
	}

	return c.JSON(http.StatusOK, s)
}

// GetBySubServiceID find one by id
func (st *Service) GetBySubServiceID(c echo.Context) error {
	s, err := dao.GetServiceBySubSeriveID(c.Param("subserviceID"))

	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// Save a Service server
func (st *Service) Save(c echo.Context) error {
	var u types.Service

	// get form data
	form, err := c.MultipartForm()
	if err == nil {
		// formating the datas
		if json.Unmarshal([]byte(form.Value[types.FORM_DATA_DATA_FIELD_NAME][0]), &u) != nil {
			return c.JSON(http.StatusBadRequest, err)
		}

		// Looping the files
		for i := 0; i < len(form.File[types.FORM_DATA_FILES_FIELD_NAME]); i++ {

			src, err := form.File[types.FORM_DATA_FILES_FIELD_NAME][i].Open()
			defer src.Close()

			// Convert to byte
			file, err := ioutil.ReadAll(src)
			if err != nil {
				return c.JSON(http.StatusBadRequest, err.Error())
			}

			var sf types.SubService
			sf.File = string(file)
			sf.Active = true

			u.SubServices = append(u.SubServices, sf)
		}

		if len(form.File[types.FORM_DATA_IMAGES_FIELD_NAME]) > 0 {
			src, err := form.File[types.FORM_DATA_IMAGES_FIELD_NAME][0].Open()
			defer src.Close()

			// Get the base 64 encode
			u.Image, err = ioutil.ReadAll(src)
			if err != nil {
				return c.JSON(http.StatusBadRequest, err.Error())
			}
		}
	} else {
		err := c.Bind(&u)
		if err != nil {
			return c.JSON(http.StatusBadRequest, err.Error())
		}
	}

	s, err := dao.CreateOrUpdateService(u)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// DeleteByID delete one by id
func (st *Service) DeleteByID(c echo.Context) error {
	err := dao.DeleteService(c.Param("serviceID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, "ok")
}
