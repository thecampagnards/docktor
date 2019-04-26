package main

import (
	"docktor/server/handler/admin"
	"docktor/server/handler/daemons"
	"docktor/server/handler/groups"
	"docktor/server/handler/images"
	"docktor/server/handler/services"
	"docktor/server/handler/users"
	"docktor/server/helper/ldap"
	"docktor/server/jobs"
	customMiddleware "docktor/server/middleware"
	"docktor/server/storage"
	"docktor/server/types"
	"fmt"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/namsral/flag"
	"github.com/sirupsen/logrus"
	log "github.com/sirupsen/logrus"
)

var (
	production           bool
	logLevel             string
	defaultAdminAccount  string
	defaultAdminPassword string
	ldapAuthConfig       = ldap.AuthConfig{}
	ldapSearchConfig     = ldap.SearchConfig{}
	jwtSecret            string
	mongoURL             string
	cronSpec             string
)

func parseFlags() {
	flag.String(flag.DefaultConfigFlagname, "", "Path to config file")
	flag.BoolVar(&production, "production", false, "Enable the production mode")
	flag.StringVar(&logLevel, "log-level", "debug", "The log level to use (debug, info, warn, error, fatal, panic)")
	flag.StringVar(&defaultAdminAccount, "default-admin-account", "root", "The username of a default administrator account")
	flag.StringVar(&defaultAdminPassword, "default-admin-password", "root", "The password of a default administrator account")
	flag.StringVar(&ldapAuthConfig.Host, "ldap-host", "", "The host of the LDAP to connect to")
	flag.IntVar(&ldapAuthConfig.Port, "ldap-port", 389, "The port of the LDAP to connect to")
	flag.BoolVar(&ldapAuthConfig.Secure, "ldap-secure", false, "The LDAP needs TLS connection")
	flag.StringVar(&ldapAuthConfig.BindDN, "ldap-bind-dn", "", "The DN of a LDAP user able to perform queries")
	flag.StringVar(&ldapAuthConfig.BindPassword, "ldap-bind-password", "", "The password associated to the ldap-bind-dn user")
	flag.StringVar(&ldapSearchConfig.BaseDN, "ldap-base-dn", "", "The base DN where to search for users")
	flag.StringVar(&ldapSearchConfig.SearchFilter, "ldap-search-filter", "", "The search filter")
	flag.StringVar(&ldapSearchConfig.Attributes.Username, "ldap-attr-username", "", "The LDAP attribute corresponding to the username of an account")
	flag.StringVar(&ldapSearchConfig.Attributes.FirstName, "ldap-attr-firstname", "", "The LDAP attribute corresponding to the first name of an account")
	flag.StringVar(&ldapSearchConfig.Attributes.LastName, "ldap-attr-lastname", "", "The LDAP attribute corresponding to the last name of an account")
	flag.StringVar(&ldapSearchConfig.Attributes.Email, "ldap-attr-email", "", "The LDAP attribute corresponding to the email address of an account")
	flag.StringVar(&jwtSecret, "jwt-secret", "secret", "The secret used to sign JWT tokens")
	flag.StringVar(&mongoURL, "mongo-url", "localhost", "The mongo db url")
	flag.StringVar(&cronSpec, "cron-refresh", "@every 30m", "Text param of cron functions to define refresh time")
	flag.Parse()
}

func configure(e *echo.Echo) {
	l, err := log.ParseLevel(logLevel)
	if err != nil {
		log.Fatalf("Error when parsing log level: %s", err)
	}
	log.SetLevel(l)

	storage.Connect(mongoURL)

	dock, err := storage.Get()
	if err != nil {
		log.WithError(err).Fatal("Can't ensure that indexes have been created")
		return
	}
	defer dock.Close()
	for _, db := range dock.Collections() {
		if dbWithIndex, ok := db.(storage.IsCollectionWithIndexes); ok {
			log.Infof("Ensuring indexes creating for '%v' collection", db.GetCollectionName())
			err := dbWithIndex.CreateIndexes()
			if err != nil {
				log.WithError(err).Error("Cannot create index")
			}
		}
	}

	user := types.User{}
	user.Username = defaultAdminAccount
	user.Role = types.ADMIN_ROLE
	user.Password = user.EncodePassword(defaultAdminPassword)

	_, err = dock.Users().Save(user)
	if err != nil {
		log.Fatalf("Error when creating the admin account: %s", err)
	}
	log.WithField("user", user).Info("Admin account successfully created")

	if production {
		log.Info("Running in production mode")
		if len(jwtSecret) < 32 { // 32 bytes is a sane default to protect against bruteforce attacks
			log.Fatal("JWT secret must be at least 32 characters long")
		}
	} else {
		log.Warn("Running in development mode")
	}

	jobs.RunBackgroundJobs(cronSpec)
}

func main() {
	parseFlags()

	e := echo.New()
	configure(e)

	e.Logger = customMiddleware.Logger{Logger: logrus.StandardLogger()}
	e.Use(customMiddleware.Hook())
	e.Use(middleware.Recover())
	e.Use(middleware.Gzip())
	e.Use(customMiddleware.DB)
	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Root:  "client",
		Index: "index.html",
	}))

	auth := e.Group("/api/auth")
	auth.Use(customMiddleware.LDAP(ldapAuthConfig, ldapSearchConfig))
	users.AddAuthRoute(auth, jwtSecret)

	api := e.Group("/api")
	api.Use(middleware.JWTWithConfig(middleware.JWTConfig{
		Claims:     &types.Claims{},
		SigningKey: []byte(jwtSecret),
		BeforeFunc: func(c echo.Context) {
			// If no headers auth use wuery param
			if c.Request().Header.Get(echo.HeaderAuthorization) == "" {
				token := c.QueryParam(types.JWT_QUERY_PARAM)
				c.Request().Header.Set(echo.HeaderAuthorization, fmt.Sprintf("Bearer %s", token))
			}
		},
	}))
	api.Use(customMiddleware.WithUser)

	admin.AddRoute(api)
	daemons.AddRoute(api)
	groups.AddRoute(api)
	services.AddRoute(api)
	users.AddRoute(api)
	images.AddRoute(api)

	e.GET("/*", getIndex)

	e.Logger.Fatal(e.Start(":8080"))
}

// getIndex handler which render the index.html
func getIndex(c echo.Context) error {
	return c.File("client/index.html")
}
