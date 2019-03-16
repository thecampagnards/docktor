package dao

import (
	"docktor/server/config"
	"docktor/server/types"
	"errors"

	"github.com/globalsign/mgo/bson"
	"github.com/imdario/mergo"
)

// GetDaemons get all daemons
func GetDaemons() (types.Daemons, error) {
	db := config.DB{}
	t := types.Daemons{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(types.DAEMONS_DB_COLUMN)

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

	c := s.DB(db.Name()).C(types.DAEMONS_DB_COLUMN)

	err = c.Find(bson.M{"_id": bson.ObjectIdHex(id)}).One(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the deaemon")
	}

	return t, err
}

// CreateOrUpdateDaemon create or update daemon
func CreateOrUpdateDaemon(t types.Daemon) (types.Daemon, error) {
	db := config.DB{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect to the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(types.DAEMONS_DB_COLUMN)

	if err != nil {
		return t, errors.New("There was an error trying to insert the daemon to the DB")
	}

	if t.ID.Valid() {
		daemon, _ := GetDaemonByID(t.ID.Hex())
		if err := mergo.Merge(&t, daemon); err != nil {
			return t, err
		}
		err = c.UpdateId(t.ID, t)
	} else {
		t.ID = bson.NewObjectId()
		err = c.Insert(t)
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

	c := s.DB(db.Name()).C(types.DAEMONS_DB_COLUMN)

	err = c.RemoveId(bson.ObjectIdHex(id))

	if err != nil {
		return errors.New("There was an error trying to remove the daemon")
	}

	return err
}
