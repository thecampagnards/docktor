package main

import (
	"docktor/server/handler"
	"docktor/server/helper/ldap"
	customMiddleware "docktor/server/middleware"
	"docktor/server/types"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/labstack/gommon/log"
	"github.com/namsral/flag"
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
)

func parseFlags() {
	flag.String(flag.DefaultConfigFlagname, "conf", "Path to config file")
	flag.BoolVar(&production, "production", false, "Enable the production mode")
	flag.StringVar(&logLevel, "log-level", "error", "The log level to use (debug, info, warn, error, fatal, panic)")
	flag.StringVar(&defaultAdminAccount, "default-admin-account", "root", "The username of a default administrator account")
	flag.StringVar(&defaultAdminPassword, "default-admin-password", "", "The password of a default administrator account")
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
	flag.StringVar(&jwtSecret, "jwt-secret", "CHANGE-ME", "The secret used to sign JWT tokens")
	flag.StringVar(&mongoURL, "mongo-url", "localhost", "The mongo db url")
	flag.Parse()
}

func configure(e *echo.Echo) {
	e.Logger.SetLevel(log.DEBUG)

	if production {
		e.Logger.Info("Running in production mode")
		if len(jwtSecret) < 32 { // 32 bytes is a sane default to protect against bruteforce attacks
			e.Logger.Fatal("JWT secret must be at least 32 characters long")
		}
	} else {
		e.Logger.Warn("Running in development mode")
	}
}

func main() {
	parseFlags()

	e := echo.New()
	configure(e)

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.Gzip())
	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Root:  "client",
		Index: "index.html",
	}))

	config := middleware.JWTConfig{
		Claims:     &types.User{},
		SigningKey: []byte(jwtSecret),
	}

	e.Logger.SetLevel(log.DEBUG)

	api := e.Group("/api")

	Daemon := handler.Daemon{}
	Group := handler.Group{}
	Admin := handler.Admin{}
	Compose := handler.Compose{}
	Service := handler.Service{}
	User := handler.User{}

	daemon := api.Group("/daemons")
	daemon.GET("/:daemonID/log/:containerID", Daemon.GetContainerLog)
	daemon.GET("/:daemonID/commands/:containerID", Daemon.RunContainerCommands)
	daemon.GET("/:daemonID/ssh/term", Daemon.RunSSHCommands)
	daemon.POST("/:daemonID/ssh/exec", Daemon.ExecSSHCommands)
	daemon.POST("/:daemonID/containers/status", Daemon.StatusContainers)
	daemon.POST("/:daemonID/services/status", Compose.StartDaemonService)
	daemon.GET("/:daemonID/containers", Daemon.GetContainers)
	daemon.GET("/:daemonID/cadvisor/machine", Daemon.GetCAdvisorMachineInfo)
	daemon.GET("/:daemonID/cadvisor/container", Daemon.GetCAdvisorContainerInfo)
	daemon.GET("/:daemonID", Daemon.GetByID)
	daemon.DELETE("/:daemonID", Daemon.DeleteByID)
	daemon.GET("", Daemon.GetAll)
	daemon.POST("", Daemon.Save)

	// For service
	service := api.Group("/services")
	service.GET("/subservice/:subserviceID", Service.GetBySubServiceID)
	service.GET("/:serviceID", Service.GetByID)
	service.DELETE("/:serviceID", Service.DeleteByID)
	service.GET("", Service.GetAll)
	service.POST("", Service.Save)

	// For group
	group := api.Group("/groups")
	group.GET("/:groupID", Group.GetByID)
	group.DELETE("/:groupID", Group.DeleteByID)
	group.POST("/:groupID/start/:subserviceID", Compose.StartSubService)
	group.GET("/:groupID/containers", Group.GetContainers)
	group.GET("", Group.GetAll)
	group.POST("", Group.Save)

	// For user
	user := api.Group("/users")
	user.Use(customMiddleware.LDAP(ldapAuthConfig, ldapSearchConfig))
	user.GET("/:username", User.GetByUsername)
	user.DELETE("/:username", User.DeleteByUsername)
	user.GET("", User.GetAll)
	user.POST("", User.Save)
	user.POST("/login", User.Login)

	// For admin
	admin := api.Group("/admin")
	admin.Use(middleware.JWTWithConfig(config))
	admin.GET("/assets", Admin.GetAssets)
	admin.POST("/assets/:assetName", Admin.SaveAsset)

	e.GET("/*", GetIndex)

	e.Logger.Fatal(e.Start(":8080"))
}

// GetIndex handler which render the index.html
func GetIndex(c echo.Context) error {
	return c.File("client/index.html")
}
