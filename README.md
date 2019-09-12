# Docktor

[![Build Status](https://travis-ci.org/thecampagnards/docktor.svg?branch=master)](https://travis-ci.org/thecampagnards/docktor)
[![Go Report Card](https://goreportcard.com/badge/github.com/thecampagnards/docktor)](https://goreportcard.com/report/github.com/thecampagnards/docktor)
[![Dependencies](https://david-dm.org/thecampagnards/docktor/status.svg?path=client)](https://david-dm.org/thecampagnards/docktor?path=client&view=list)
[![Dev Dependencies](https://david-dm.org/thecampagnards/docktor/dev-status.svg?path=client)](https://david-dm.org/thecampagnards/docktor?path=client&type=dev&view=list)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=thecampagnards_docktor&metric=alert_status)](https://sonarcloud.io/dashboard/index/thecampagnards_docktor)

Docktor is a platform for administrating and deploying SaaS services based on Docker.

## Installation

### Docker compose

You can simply install `docker-compose` and run this command:

```sh
docker-compose up
```

### Only docker

Docker image available here <https://hub.docker.com/r/thecampagnards/docktor/>.
Run a **mongo** on localhost, then run the service with this command:

```sh
docker run -p 8080:8080 -v /data/docktor/assets:/docktor/assets thecampagnards/docktor
```

You can define some env vars, check [back section](#back):

- MONGO_URL: mongodb url (default localhost)
- JWT_SECRET: the jwt signed key (default secret)
- PRODUCTION: boolean check if everything is correct for prod (default false)
- LOG_LEVEL: the log level (default debug)
- DEFAULT_ADMIN_ACCOUNT: the default admin username (default root)
- DEFAULT_ADMIN_PASSWORD: the default admin password (default root)

## Developpement

Docktor is a Go/React(TS) app and use [libcompose](https://github.com/docker/libcompose) and [docker-api](https://github.com/moby/moby). This project use [dependabot](https://dependabot.com/) to keep dependencies up-to-date.

### Installation

#### DB

Docktor needs a mongo as DB. To run a mongo use this command:

```bash
docker run -v /data:/data/db --net host --rm mongo
```

#### Back

Go version used 1.13.

Create file `conf`, adds the flag and its value separates from a space to change its default value.

```text
Usage of server:
  -config string
        Path to config file (default "conf")
  -cron-refresh string
        Text param of cron functions to define refresh time (default "@every 30m")
  -default-admin-account string
        The username of a default administrator account (default "root")
  -default-admin-password string
        The password of a default administrator account (default "root")
  -jwt-secret string
        The secret used to sign JWT tokens (default "secret")
  -ldap-attr-email string
        The LDAP attribute corresponding to the email address of an account
  -ldap-attr-firstname string
        The LDAP attribute corresponding to the first name of an account
  -ldap-attr-lastname string
        The LDAP attribute corresponding to the last name of an account
  -ldap-attr-username string
        The LDAP attribute corresponding to the username of an account
  -ldap-base-dn string
        The base DN where to search for users
  -ldap-bind-dn string
        The DN of a LDAP user able to perform queries
  -ldap-bind-password string
        The password associated to the ldap-bind-dn user
  -ldap-host string
        The host of the LDAP to connect to
  -ldap-port int
        The port of the LDAP to connect to (default 389)
  -ldap-search-filter string
        The search filter
  -ldap-secure
        The LDAP needs TLS connection
  -log-level string
        The log level to use (debug, info, warn, error, fatal, panic) (default "debug")
  -mongo-url string
        The mongo db url (default "localhost")
  -production
        Enable the production mode
```

```bash
cd server
go run .
```

or

```bash
docker run -v $(pwd)/server:/server --net host --rm -ti golang:1.13 sh -c 'cd /server && go run .'
```

#### Front

Node version used 12.

```bash
cd client
npm install
npm start
```

or

```bash
docker run -v $(pwd)/client:/client --net host --rm -ti node:12 sh -c 'cd /client && npm install && npm start'
```
