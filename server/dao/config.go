package dao

import (
	"docktor/server/config"
	"docktor/server/types"
	"errors"

	"github.com/globalsign/mgo/bson"
)

// GetMessage get the banner message
func GetMessage() (types.Message, error) {
	db := config.DB{}
	t := types.Message{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(types.CONFIG_DB_COLUMN)

	err = c.Find(bson.M{}).One(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the message")
	}

	return t, err
}

// CreateOrUpdateMessage create or update the banner message
func CreateOrUpdateMessage(t types.Message) (types.Message, error) {
	db := config.DB{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect to the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(types.CONFIG_DB_COLUMN)

	if err != nil {
		return t, errors.New("There was an error trying to insert the message to the DB")
	}

	err = c.Insert(t)
	err = c.Update(bson.M{}, t)

	return t, err
}
