module docktor/server

go 1.14

replace github.com/docker/docker => github.com/moby/moby v1.4.2-0.20200309214505-aa6a9891b09c

require (
	github.com/dgrijalva/jwt-go v3.2.0+incompatible
	github.com/docker/docker v17.12.0-ce-rc1.0.20200916142827-bd33bbf0497b+incompatible
	github.com/docker/go-connections v0.4.0
	github.com/globalsign/mgo v0.0.0-20181015135952-eeefdecb41b8
	github.com/go-ldap/ldap/v3 v3.2.4
	github.com/google/cadvisor v0.38.8
	github.com/labstack/echo/v4 v4.2.0
	github.com/labstack/gommon v0.3.0
	github.com/namsral/flag v1.7.4-pre
	github.com/portainer/libcompose v0.5.3
	github.com/robfig/cron v1.2.0
	github.com/sirupsen/logrus v1.8.0
	golang.org/x/crypto v0.0.0-20200820211705-5c72a883971a
	golang.org/x/net v0.0.0-20201110031124-69a78807bb2b
	gopkg.in/yaml.v3 v3.0.0-20200615113413-eeeca48fe776
)
