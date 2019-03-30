package dao

import (
	"docktor/server/db"
	"docktor/server/types"
	"errors"

	"github.com/globalsign/mgo/bson"
	"github.com/imdario/mergo"
)

// GetConfig get the config
func GetConfig() (types.Config, error) {
	db := db.DB{}
	t := types.Config{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(types.CONFIG_DB_COLUMN)

	err = c.Find(bson.M{}).One(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the config")
	}

	return t, err
}

// CreateOrUpdateConfig create or update the config
func CreateOrUpdateConfig(t types.Config) (types.Config, error) {
	db := db.DB{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect to the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(types.CONFIG_DB_COLUMN)

	config, err := GetConfig()

	if err != nil {
		err = c.Insert(t)
	} else {
		if err := mergo.Merge(&t, config); err != nil {
			return t, err
		}
		err = c.Update(bson.M{}, t)
	}
	if err != nil {
		return t, errors.New("There was an error trying to insert the config to the DB")
	}

	return t, err
}
