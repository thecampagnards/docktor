package handler

import (
	"net/http"

	"docktor/server/dao"
	"docktor/server/types"

	"github.com/labstack/echo"
)

// User struct which contains the functions of this class
type User struct {
}

// GetAll find all
func (st *User) GetAll(c echo.Context) error {
	s, err := dao.GetUsers()
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// GetByUsername find one by name
func (st *User) GetByUsername(c echo.Context) error {
	s, err := dao.GetUserByUsername(c.Param("username"))

	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// Save a User server
func (st *User) Save(c echo.Context) error {
	var u types.User
	err := c.Bind(&u)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	s, err := dao.CreateOrUpdateUser(u)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// DeleteByUsername delete one by username
func (st *User) DeleteByUsername(c echo.Context) error {
	err := dao.DeleteUser(c.Param("username"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, "ok")
}

// Login TODO root/root and user/user for auth
func (st *User) Login(c echo.Context) error {
	var u types.User
	err := c.Bind(&u)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	if u.Username == "root" && u.Password == "root" {
		u.Role = types.ADMIN_ROLE
		t, err := u.CreateToken()
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, t)
	}

	if u.Username == "user" && u.Password == "user" {
		u.Role = types.USER_ROLE
		groups, err := dao.GetGroups()
		if err != nil {
			return c.JSON(http.StatusBadRequest, err.Error())
		}
		u.Groups = append(u.Groups, groups[0].ID)
		t, err := u.CreateToken()
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, t)
	}

	return c.JSON(http.StatusBadRequest, "Wrong credentials")
}

/*
// Login a User server
func (st *User) Login(c echo.Context) error {
	var u types.User
	err := c.Bind(&u)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	s, err := dao.LoginUser(u.Username, u.Password)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}*/
