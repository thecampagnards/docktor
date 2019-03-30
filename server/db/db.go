package db

import (
	"github.com/globalsign/mgo"
)

var dburl string

// DB
type DB struct {
	Session *mgo.Session
}

// DoDial
func (db *DB) DoDial() (s *mgo.Session, err error) {
	return mgo.Dial(DBUrl())
}

// Name
func (db *DB) Name() string {
	return "docktor"
}

// DBUrl
func DBUrl() string {

	if dburl == "" {
		dburl = "localhost"
	}

	return dburl
}

// Init
func Init(db string) {
	dburl = db
}
