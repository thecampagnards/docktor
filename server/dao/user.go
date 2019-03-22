package dao

import (
	"errors"

	"docktor/server/config"
	"docktor/server/types"

	"github.com/globalsign/mgo/bson"
	"github.com/imdario/mergo"
)

// GetUsers get all users
func GetUsers() (types.Users, error) {
	db := config.DB{}
	t := types.Users{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(types.USERS_DB_COLUMN)

	err = c.Find(bson.M{}).All(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the users")
	}

	return t, err
}

// GetUserByUsername get one user by username
func GetUserByUsername(username string) (types.User, error) {
	db := config.DB{}
	t := types.User{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(types.USERS_DB_COLUMN)

	err = c.Find(bson.M{"attributes.username": username}).One(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the user")
	}

	return t, err
}

// GetUserByUsernameWithGroupsAndDaemons get one user by username with group and daemons
func GetUserByUsernameWithGroupsAndDaemons(username string) (types.User, error) {
	db := config.DB{}
	t := types.User{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(types.USERS_DB_COLUMN)

	err = c.Pipe([]bson.M{
		bson.M{"$match": bson.M{
			"attributes.username": username,
		}},
		bson.M{"$lookup": bson.M{
			"from":         types.GROUPS_DB_COLUMN,
			"localField":   "groups",
			"foreignField": "_id",
			"as":           "groupsdata",
		}},
		bson.M{"$unwind": bson.M{
			"path": "$groupsdata",
			"preserveNullAndEmptyArrays": true,
		}},
		bson.M{"$lookup": bson.M{
			"from":         types.DAEMONS_DB_COLUMN,
			"localField":   "groupsdata.daemonid",
			"foreignField": "_id",
			"as":           "groupsdata.daemon",
		}},
		bson.M{"$unwind": bson.M{
			"path": "$groupsdata.daemon",
			"preserveNullAndEmptyArrays": true,
		}},
		bson.M{"$group": bson.M{
			"_id":        "$_id",
			"attributes": bson.M{"$first": "$attributes"},
			"role":       bson.M{"$first": "$role"},
			"groupsdata": bson.M{"$push": "$groupsdata"},
		}},
		bson.M{"$project": bson.M{
			"groupsdata.daemon.ssh":         0,
			"groupsdata.daemon.docker":      0,
			"groupsdata.daemon.cadvisor":    0,
			"groupsdata.daemon.description": 0,
		}},
	}).One(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the user")
	}

	return t, err
}

// LoginUser check username and password
func LoginUser(username string, password string) (types.User, error) {
	db := config.DB{}
	t := types.User{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(types.USERS_DB_COLUMN)

	err = c.Find(bson.M{"attributes.username": username, "password": password}).One(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the user")
	}

	return t, err
}

// CreateOrUpdateUser create or update user
func CreateOrUpdateUser(t types.User) (types.User, error) {
	db := config.DB{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect to the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(types.USERS_DB_COLUMN)

	if err != nil {
		return t, errors.New("There was an error trying to insert the user to the DB")
	}

	user, err := GetUserByUsername(t.Username)

	if err != nil {
		t.Password = t.EncodePassword(t.Password)
		err = c.Insert(t)
	} else {
		if err := mergo.Merge(&t, user); err != nil {
			return t, err
		}
		err = c.Update(bson.M{"attributes.username": t.Username}, t)
	}

	return t, err
}

// DeleteUser remove a user by username
func DeleteUser(username string) error {
	db := config.DB{}

	s, err := db.DoDial()

	if err != nil {
		return errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(types.USERS_DB_COLUMN)

	err = c.Remove(bson.M{"attributes.username": username})

	if err != nil {
		return errors.New("There was an error trying to remove the user")
	}

	return err
}
