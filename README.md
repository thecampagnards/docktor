# Docktor

[![Build Status](https://travis-ci.org/thecampagnards/docktor.svg?branch=master)](https://travis-ci.org/thecampagnards/docktor)
[![Go Report Card](https://goreportcard.com/badge/github.com/thecampagnards/docktor)](https://goreportcard.com/report/github.com/thecampagnards/docktor)
[![Dependencies](https://david-dm.org/thecampagnards/docktor/status.svg?path=client)](https://david-dm.org/thecampagnards/docktor?path=client&view=list)
[![Dev Dependencies](https://david-dm.org/thecampagnards/docktor/dev-status.svg?path=client)](https://david-dm.org/thecampagnards/docktor?path=client&type=dev&view=list)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=thecampagnards_docktor&metric=alert_status)](https://sonarcloud.io/dashboard/index/thecampagnards_docktor)

Docktor is a platform for administrating and deploying SaaS services based on Docker.

## Todo

- [ ] Add unit tests
- [ ] User's permissions
- [ ] Home page
- [ ] Docker compose network ip
- [ ] Clean DB types and api types
- [ ] Favourites system
- [ ] Use official compose parse https://github.com/docker/cli/tree/master/cli/compose

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

- MONGOHQ_URL: mongodb url (default localhost)
- JWT_SECRET: the jwt signed key (default secret)

## Developpement

Docktor is a Go/React(TS) app and use [libcompose](https://github.com/docker/libcompose) and [docker-api](https://github.com/moby/moby). This project use [dependabot](https://dependabot.com/) to keep dependencies up-to-date.

### Installation

#### Back

```bash
go get -u github.com/golang/dep/cmd/dep
dep ensure
go run .
```

#### Front

```bash
cd client
npm install
npm start
```
