package dao

import (
	"errors"
	"web-docker-manager/server/config"
	"web-docker-manager/server/types"

	"github.com/globalsign/mgo/bson"
)

const colDaemon string = "daemons"

// GetDaemons get all daemons
func GetDaemons() (types.Daemons, error) {
	db := config.DB{}
	t := types.Daemons{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(colDaemon)

	err = c.Find(bson.M{}).All(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the daemons")
	}

	return t, err
}

// GetDaemonByID get one daemon by id
func GetDaemonByID(id string) (types.Daemon, error) {
	db := config.DB{}
	t := types.Daemon{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(colDaemon)

	err = c.Find(bson.M{"_id": bson.ObjectIdHex(id)}).One(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the deaemon")
	}

	return t, err
}

// CreateDaemon create a new daemon
func CreateDaemon(t types.Daemon) (types.Daemon, error) {
	db := config.DB{}
	t.ID = bson.NewObjectId()

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect to the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(colDaemon)

	err = c.Insert(t)

	if err != nil {
		return t, errors.New("There was an error trying to insert the daemon to the DB")
	}

	return t, err
}

// DeleteDaemon remove a daemon by id
func DeleteDaemon(id string) error {
	db := config.DB{}

	s, err := db.DoDial()

	if err != nil {
		return errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(colDaemon)

	err = c.RemoveId(bson.ObjectIdHex(id))

	if err != nil {
		return errors.New("There was an error trying to remove the daemon")
	}

	return err
}
