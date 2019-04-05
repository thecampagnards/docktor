package users

import (
	"net/http"
	"strconv"

	"docktor/server/helper/ldap"
	"docktor/server/storage"
	"docktor/server/types"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// login a User server
func login(c echo.Context) error {
	if ok, _ := strconv.ParseBool(c.QueryParam("ldap")); ok {
		return loginLDAP(c)
	}
	return loginLocal(c)
}

// loginLDAP a User server
func loginLDAP(c echo.Context) error {
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
		log.WithError(err).WithField("username", u.Username).Warn("LDAP authentication error")
		return echo.NewHTTPError(http.StatusUnauthorized, "Authentication failed")
	}

	log.WithFields(log.Fields{
		"username":   u.Username,
		"attributes": attributes,
	}).Info("LDAP authentication successful")

	db := c.Get("DB").(*storage.Docktor)
	user, err := db.Users().FindByUsername(u.Username)
	if err != nil {
		log.WithField("username", u.Username).Info("Adding user to the database")
		user.Role = types.USER_ROLE
	}
	// Update attributes even if they're already present
	user.Attributes = attributes

	user, err = db.Users().Save(user)
	if err != nil {
		log.WithError(err).WithField("user", user).Error("Failed to save user")
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to synchronize user data")
	}

	// JWT token creation
	token, err := user.CreateToken(c.Get("jwtSecret").(string))
	if err != nil {
		log.WithError(err).WithField("username", u.Username).Error("Token creation error")
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create user token")
	}
	log.WithField("username", u.Username).Info("Token creation successful")

	return c.JSON(http.StatusOK, token)
}

// loginLocal a User server
func loginLocal(c echo.Context) error {
	var u types.User
	err := c.Bind(&u)
	if err != nil {
		log.WithFields(log.Fields{
			"body":  c.Request().Body,
			"error": err,
		}).Error("Error when parsing user")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	db := c.Get("DB").(*storage.Docktor)
	user, err := db.Users().FindByUsername(u.Username)
	if err != nil {
		log.WithError(err).WithField("username", u.Username).Warn("Local authentication error")
		return echo.NewHTTPError(http.StatusUnauthorized, "Authentication failed")
	}

	if !user.CheckPassword(u.Password) {
		log.WithError(err).WithField("user", user).Error("Wrong password")
		return echo.NewHTTPError(http.StatusUnauthorized, "Wrong password")
	}

	// JWT token creation
	token, err := user.CreateToken(c.Get("jwtSecret").(string))
	if err != nil {
		log.WithError(err).WithField("username", u.Username).Error("Token creation error")
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create user token")
	}
	log.WithField("username", u.Username).Info("Token creation successful")

	return c.JSON(http.StatusOK, token)
}

func profile(c echo.Context) error {
	user := c.Get("user").(types.User)
	db := c.Get("DB").(*storage.Docktor)

	groups, err := db.Groups().FindByUser(user)
	if err != nil {
		log.WithError(err).WithField("username", user.Username).Error("When retreive groups for profile")
	}

	return c.JSON(http.StatusOK, types.Profile{User: user, Groups: groups})
}
