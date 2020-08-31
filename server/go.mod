module docktor/server

go 1.14

replace github.com/docker/docker => github.com/moby/moby v1.4.2-0.20200309214505-aa6a9891b09c

require (
	github.com/dgrijalva/jwt-go v3.2.0+incompatible
	github.com/docker/docker v0.7.3-0.20190327010347-be7ac8be2ae0
	github.com/docker/go-connections v0.4.0
	github.com/globalsign/mgo v0.0.0-20181015135952-eeefdecb41b8
	github.com/go-ldap/ldap/v3 v3.2.3
	github.com/google/cadvisor v0.37.0
	github.com/labstack/echo/v4 v4.1.17
	github.com/labstack/gommon v0.3.0
	github.com/namsral/flag v1.7.4-pre
	github.com/portainer/libcompose v0.5.3
	github.com/robfig/cron v1.2.0
	github.com/sirupsen/logrus v1.6.0
	golang.org/x/crypto v0.0.0-20200820211705-5c72a883971a
	golang.org/x/net v0.0.0-20200822124328-c89045814202
	gopkg.in/yaml.v3 v3.0.0-20200615113413-eeeca48fe776
)
