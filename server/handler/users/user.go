package users

import (
	"net/http"

	"docktor/server/dao"
	"docktor/server/types"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// getAll find all
func getAll(c echo.Context) error {
	s, err := dao.GetUsers()
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when retrieving users")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// getByUsername find one by name
func getByUsername(c echo.Context) error {
	s, err := dao.GetUserByUsername(c.Param(types.USERNAME_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"username": c.Param(types.USERNAME_PARAM),
			"error":    err,
		}).Error("Error when retrieving user")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// save a User server
func save(c echo.Context) error {
	var u types.User
	err := c.Bind(&u)
	if err != nil {
		log.WithFields(log.Fields{
			"body":  c.Request().Body,
			"error": err,
		}).Error("Error when parsing user")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	s, err := dao.CreateOrUpdateUser(u)
	if err != nil {
		log.WithFields(log.Fields{
			"user":  u,
			"error": err,
		}).Error("Error when saving/creating user")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, s)
}

// deleteByUsername delete one by username
func deleteByUsername(c echo.Context) error {
	err := dao.DeleteUser(c.Param(types.USERNAME_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"username": c.Param(types.USERNAME_PARAM),
			"error":    err,
		}).Error("Error when deleting user")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, "ok")
}

// login TODO root/root and user/user for auth
func login(c echo.Context) error {
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
// login a User server
func login(c echo.Context) error {
	var u types.User
	err := c.Bind(&u)
	if err != nil {
		log.WithFields(log.Fields{
			"body":  c.Request().Body,
			"error": err,
		}).Error("Error when parsing user")
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
*/
// AuthUser
func AuthUser(c echo.Context) (types.User, error) {
	user := c.Get("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	username := claims["Username"].(string)

	return dao.GetUserByUsername(username)
}
