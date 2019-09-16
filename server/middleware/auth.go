package middleware

import (
	"net/http"
	"regexp"
	"strings"

	"docktor/server/storage"
	"docktor/server/types"

	jwt "github.com/dgrijalva/jwt-go"
	typesDocker "github.com/docker/docker/api/types"
	"github.com/labstack/echo/v4"
	log "github.com/sirupsen/logrus"
)

// WithUser check if user is auth
func WithUser(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user, err := AuthUser(c)
		if err != nil {
			return echo.NewHTTPError(http.StatusForbidden, err.Error())
		}

		c.Set("user", user)
		return next(c)
	}
}

// WithAdmin (need WithUser) check if user is admin
func WithAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user := c.Get("user").(types.User)

		if !user.IsAdmin() {
			return echo.NewHTTPError(http.StatusForbidden, "Admin permission required")
		}

		return next(c)
	}
}

// WithGroup (need WithUser) check if it's user group
func WithGroup(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user := c.Get("user").(types.User)
		/*
			if user.IsAdmin() {
				return next(c)
			}
		*/
		db := c.Get("DB").(*storage.Docktor)

		group, err := db.Groups().FindByID(c.Param(types.GROUP_ID_PARAM))
		if err != nil {
			log.WithFields(log.Fields{
				"groupID": c.Param(types.GROUP_ID_PARAM),
				"error":   err,
			}).Error("Error when retrieving group")
			return echo.NewHTTPError(http.StatusForbidden, err.Error())
		}

		log.WithFields(log.Fields{
			"group": group.Name,
			"user":  user,
		}).Debug("Check if group is yours")

		if !group.IsMyGroup(&user) {
			return echo.NewHTTPError(http.StatusForbidden, "This is not your group")
		}

		c.Set("group", group)
		return next(c)
	}
}

// WithGroupAdmin (need WithUser, WithGroup or WithDaemonContainer) check if user is admin on this group
func WithGroupAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user := c.Get("user").(types.User)

		if user.IsAdmin() {
			return next(c)
		}

		group := c.Get("group").(types.Group)

		if !group.IsAdmin(&user) {
			return echo.NewHTTPError(http.StatusForbidden, "Group admin permission required")
		}

		return next(c)
	}
}

// WithDaemon (need WithUser) check if user has permission on the daemon
func WithDaemon(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user := c.Get("user").(types.User)

		if user.IsAdmin() {
			return next(c)
		}

		db := c.Get("DB").(*storage.Docktor)

		groups, err := db.Groups().FindByUser(user)
		if err != nil {
			log.WithFields(log.Fields{
				"user":  user.Username,
				"error": err,
			}).Error("Error when retrieving user groups")
			return echo.NewHTTPError(http.StatusForbidden, err.Error())
		}

		for _, group := range groups {
			if group.Daemon.Hex() == c.Param(types.DAEMON_ID_PARAM) {
				return next(c)
			}
		}
		return echo.NewHTTPError(http.StatusForbidden, "No group permission on this daemon")
	}
}

// WithDaemonContainer (need WithUser) check if user has permission on the daemon and container
func WithDaemonContainer(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user := c.Get("user").(types.User)

		if user.IsAdmin() {
			return next(c)
		}

		db := c.Get("DB").(*storage.Docktor)

		groups, err := db.Groups().FindByUser(user)
		if err != nil {
			log.WithFields(log.Fields{
				"user":  user.Username,
				"error": err,
			}).Error("Error when retrieving user groups")
			return echo.NewHTTPError(http.StatusForbidden, err.Error())
		}

		// Remove group which don't have the right daemon id
		for i := 0; i < len(groups); i++ {
			if groups[i].Daemon.Hex() != c.Param(types.DAEMON_ID_PARAM) {
				groups = append(groups[:i], groups[i+1:]...)
			}
		}

		if len(groups) == 0 {
			log.WithFields(log.Fields{
				"Daemon":   c.Param(types.DAEMON_ID_PARAM),
				"Username": user.Username,
			}).Error("Error when retrieving group")
			return echo.NewHTTPError(http.StatusForbidden, "No group permission on this daemon")
		}

		// Check by container name
		for _, group := range groups {
			if strings.HasPrefix(types.NormalizeName(c.Param(types.CONTAINER_ID_PARAM)), types.NormalizeName(group.Name)) {
				c.Set("group", group)
				return next(c)
			}
		}

		// Check by container id
		daemon, err := db.Daemons().FindByID(c.Param(types.DAEMON_ID_PARAM))
		if err != nil {
			log.WithFields(log.Fields{
				"Daemon": c.Param(types.DAEMON_ID_PARAM),
				"error":  err,
			}).Error("Error when retrieving daemon")
			return echo.NewHTTPError(http.StatusForbidden, err.Error())
		}

		containers, err := daemon.InspectContainers(c.Param(types.CONTAINER_ID_PARAM))
		if len(containers) == 0 {
			log.WithFields(log.Fields{
				"Container": c.Param(types.CONTAINER_ID_PARAM),
				"Daemon":    daemon.Name,
				"error":     err,
			}).Error("Error when retrieving container")
			return echo.NewHTTPError(http.StatusForbidden, "Container doesn't exist")
		}

		for _, group := range groups {
			if strings.HasPrefix(types.NormalizeName(containers[0].Name), types.NormalizeName(group.Name)) {
				c.Set("group", group)
				return next(c)
			}
		}

		c.Set("container", containers[0])

		return echo.NewHTTPError(http.StatusForbidden, "You don't have permission on this container")
	}
}

// WithIsAllowShellContainer (need WithUser, WithDaemonContainer) check if user has webshell permission on the container
func WithIsAllowShellContainer(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user := c.Get("user").(types.User)

		if user.IsAdmin() {
			return next(c)
		}

		container := c.Get("container").(typesDocker.Container)

		db := c.Get("DB").(*storage.Docktor)

		images, err := db.Images().FindAll()
		if err != nil {
			log.WithFields(log.Fields{
				"error": err,
			}).Error("Error when retrieving images")
			return echo.NewHTTPError(http.StatusForbidden, err.Error())
		}

		for _, image := range images {
			if match, _ := regexp.MatchString(image.Image.Pattern, container.Image); match && image.IsAllowShell {
				return next(c)
			}
		}

		return echo.NewHTTPError(http.StatusForbidden, "You don't have shell permission on this container")
	}
}

// AuthUser return the jwt authed user
func AuthUser(c echo.Context) (types.User, error) {

	log.Info("Getting user from token")
	user := c.Get("user").(*jwt.Token)

	log.WithField("user", user).Info("Getting claims")
	claims := user.Claims.(*types.Claims)

	log.WithField("claims", claims).Info("Getting db user")
	db := c.Get("DB").(*storage.Docktor)
	return db.Users().FindByUsername(claims.Username)
}
