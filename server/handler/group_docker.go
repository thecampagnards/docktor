package handler

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"web-docker-manager/server/types"

	"web-docker-manager/server/dao"
	"web-docker-manager/server/utils"

	"github.com/labstack/echo"
)

// GetContainersByGroup get containers info by group
func (st *Group) GetContainersByGroup(c echo.Context) error {

	group, err := dao.GetGroupByID(c.Param("ID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	daemon, err := dao.GetDaemonByID(group.DaemonID.String())
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	cs, err := utils.GetContainers(daemon)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, cs)
}

// Compose files
func (st *Group) Compose(c echo.Context) error {

	group, err := dao.GetGroupByID(c.Param("ID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	daemon, err := dao.GetDaemonByID(group.DaemonID.String())
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	// get form data
	form, err := c.MultipartForm()
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	// Looping the files
	var files [][]byte
	for i := 0; i < len(form.File[types.FORM_DATA_FILES_FIELD_NAME]); i++ {

		src, err := form.File[types.FORM_DATA_FILES_FIELD_NAME][i].Open()
		defer src.Close()

		// Convert to byte
		file, err := ioutil.ReadAll(src)
		if err != nil {
			return c.JSON(http.StatusBadRequest, err.Error())
		}

		files = append(files, file)
	}

	// formating the string vars to object template vars
	var data map[string]string
	if json.Unmarshal([]byte(form.Value[types.FORM_DATA_DATA_FIELD_NAME][0]), &data) != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	for key, value := range data {
		os.Setenv(key, value)
		defer os.Unsetenv(key)
	}

	// setting the envs for the compose
	err = utils.ComposeUp(group, daemon, files...)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, "running")
}

// GetContainers get containers info by group
func (st *Group) GetContainers(c echo.Context) error {

	group, err := dao.GetGroupByID(c.Param("ID"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	daemon, err := dao.GetDaemonByID(group.DaemonID.String())
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	cs, err := utils.GetContainers(daemon)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, cs)
}
