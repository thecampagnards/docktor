# Docktor

[![Build Status](https://travis-ci.org/thecampagnards/docktor.svg?branch=master)](https://travis-ci.org/thecampagnards/docktor)
[![Go Report Card](https://goreportcard.com/badge/github.com/thecampagnards/docktor)](https://goreportcard.com/report/github.com/thecampagnards/docktor)
[![Dependencies](https://david-dm.org/thecampagnards/docktor/status.svg?path=client)](https://david-dm.org/thecampagnards/docktor?path=client&view=list)
[![Dev Dependencies](https://david-dm.org/thecampagnards/docktor/dev-status.svg?path=client)](https://david-dm.org/thecampagnards/docktor?path=client&type=dev&view=list)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=thecampagnards_docktor&metric=alert_status)](https://sonarcloud.io/dashboard/index/thecampagnards_docktor)

Docktor is a platform for administrating and deploying SaaS services based on Docker.

## Todo

- [ ] Add unit tests
- [ ] Parallelize environments requests
- [ ] User impersonate
- [ ] Use official compose parse <https://github.com/docker/cli/tree/master/cli/compose>
- [ ] Back check the ShellSocket permissions and commands permissions

## Installation

### Docker compose

You can simply install `docker-compose` and run this command:

```sh
docker-compose up
```

### Only docker

Docker image available here <https://hub.docker.com/r/thecampagnards/docktor/>.
Run a mongo on localhost, then run the service with this command:

```sh
docker run -p 8080:8080 -v /data/docktor/assets:/docktor/assets thecampagnards/docktor
```

You can define some env vars:

- MONGO_URL: mongodb url (default localhost)
- JWT_SECRET: the jwt signed key (default secret)
- PRODUCTION: boolean check if everything is correct for prod (default false)
- LOG_LEVEL: the log level (default debug)
- DEFAULT_ADMIN_ACCOUNT: the default admin username (default root)
- DEFAULT_ADMIN_PASSWORD: the default admin password (default root)

## Developpement

Docktor is a Go/React(TS) app and use [libcompose](https://github.com/docker/libcompose) and [docker-api](https://github.com/moby/moby). This project use [dependabot](https://dependabot.com/) to keep dependencies up-to-date.

### Installation

#### Back

Go version used 1.12.

```bash
cd server
go get -u github.com/golang/dep/cmd/dep
dep ensure
go run .
```

#### Front

Node version user 12.

```bash
cd client
npm install
npm start
```
