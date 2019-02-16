# Docktor

[![Build Status](https://travis-ci.org/thecampagnards/docktor.svg?branch=master)](https://travis-ci.org/thecampagnards/docktor)
[![Go Report Card](https://goreportcard.com/badge/github.com/thecampagnards/docktor)](https://goreportcard.com/report/github.com/thecampagnards/docktor)

Docktor is a platform for administrating and deploying SaaS services based on Docker.

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
docker run -p 8080:8080 thecampagnards/docktor
```

You can define some env vars:

- MONGOHQ_URL: mongodb url (default localhost)

## Developpement

### Installation

#### Back

Install dep :

```bash
go get -u github.com/golang/dep/cmd/dep
```

Get deps :

```bash
dep ensure
```

#### Front

```bash
npm install
```

### Run

#### Back

```bash
go run server.go
```

#### Front

```bash
npm start
```