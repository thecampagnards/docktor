package handler

import (
	"net/http"
	"time"

	"docktor/server/dao"
	"docktor/server/helper/ldap"
	"docktor/server/types"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
	"github.com/labstack/gommon/log"
)

const (
	authCookieName         = "docktor-token"
	apiTokenQueryParamName = "docktor-private-token"
	apiTokenHeaderName     = "X-DOCKTOR-PRIVATE-TOKEN"
	authValidity           = 24 * time.Hour
	usernameHeader         = "X-DOCKTOR-USERNAME"
	groupNameHeader        = "X-DOCKTOR-GROUPNAME"
	originalURLHeader      = "X-Original-URL"
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

/*
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
}*/

// Login a User server
func (st *User) Login(c echo.Context) error {
	var u types.User
	err := c.Bind(&u)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	l := c.Get("ldap").(*ldap.Handler)
	attributes, err := l.Auth(u.Username, u.Password)
	if err != nil {
		c.Logger().Warnf("LDAP authentication error: username %s, error %s", u.Username, err)
		return echo.NewHTTPError(http.StatusUnauthorized, "Authentication failed")
	}

	c.Logger().Infof("LDAP authentication successful: %s", u.Username)

	user, err := dao.GetUserByUsername(u.Username)
	if err != nil {
		c.Logger().Infof("Adding user to the database: %s", u.Username)
		// If the user is unknown, set ...
	}
	user.Attributes = attributes

	user, err = dao.CreateOrUpdateUser(user)
	if err != nil {
		c.Logger().Errorf("Failed to save user: %s, error %s", u.Username, err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to synchronize user data")
	}

	t, err := u.CreateToken()
	if err != nil {
		c.Logger().Errorf("Failed to create user token: %s, error %s", u.Username, err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create user token")
	}

	return c.JSON(http.StatusOK, t)
}

// AuthUser
func AuthUser(c echo.Context) (types.User, error) {
	user := c.Get("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	username := claims["Username"].(string)

	return dao.GetUserByUsername(username)
}

func retrieveToken(c echo.Context) (token string) {
	// Check if the token is used as an API token
	token = c.Request().Header.Get(apiTokenHeaderName)
	if token != "" {
		log.Info("Header mode authentication")
		return
	}

	token = c.QueryParam(apiTokenQueryParamName)
	if token != "" {
		log.Info("Query param mode authentication")
		return
	}

	// Check if the token is used as an auth token
	authCookie, err := c.Cookie(authCookieName)
	if err == nil {
		log.Info("Cookie mode authentication")
		token = authCookie.Value
	}
	return
}
