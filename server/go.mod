module docktor/server

go 1.13

replace (
	github.com/Sirupsen/logrus v1.4.0 => github.com/sirupsen/logrus v1.0.6
	github.com/docker/docker => github.com/docker/engine v0.0.0-20190725163905-fa8dd90ceb7b
)

require (
	github.com/dgrijalva/jwt-go v3.2.0+incompatible
	github.com/docker/docker v0.0.0-00010101000000-000000000000
	github.com/docker/go-connections v0.4.0
	github.com/docker/libcompose v0.4.1-0.20190808084053-143e0f3f1ab9
	github.com/globalsign/mgo v0.0.0-20181015135952-eeefdecb41b8
	github.com/google/cadvisor v0.34.0
	github.com/labstack/echo/v4 v4.1.11
	github.com/labstack/gommon v0.3.0
	github.com/namsral/flag v1.7.4-pre
	github.com/robfig/cron v1.2.0
	github.com/sirupsen/logrus v1.2.0
	golang.org/x/crypto v0.0.0-20190701094942-4def268fd1a4
	golang.org/x/net v0.0.0-20190613194153-d28f0bde5980
	gopkg.in/asn1-ber.v1 v1.0.0-20181015200546-f715ec2f112d // indirect
	gopkg.in/ldap.v3 v3.0.3
	gopkg.in/yaml.v3 v3.0.0-20190924164351-c8b7dadae555
	k8s.io/klog v1.0.0 // indirect
)
