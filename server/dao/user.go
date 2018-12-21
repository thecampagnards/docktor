package dao

import (
	"docktor/server/config"
	"docktor/server/types"
	"errors"

	"github.com/globalsign/mgo/bson"
	"github.com/imdario/mergo"
)

const colUser string = "users"

// GetUsers get all users
func GetUsers() (types.Users, error) {
	db := config.DB{}
	t := types.Users{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(colUser)

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

	c := s.DB(db.Name()).C(colUser)

	err = c.Find(bson.M{"username": username}).One(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the deaemon")
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

	c := s.DB(db.Name()).C(colUser)

	err = c.Find(bson.M{"username": username, "password": password}).One(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the deaemon")
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

	c := s.DB(db.Name()).C(colUser)

	if err != nil {
		return t, errors.New("There was an error trying to insert the user to the DB")
	}

	user, err := GetUserByUsername(t.Username)

	if err != nil {
		err = c.Insert(t)
	} else {
		if err := mergo.Merge(&t, user); err != nil {
			return t, err
		}
		err = c.Update(bson.M{"username": t.Username}, t)
	}

	return t, err
}

// DeleteUser remove a user by id
func DeleteUser(id string) error {
	db := config.DB{}

	s, err := db.DoDial()

	if err != nil {
		return errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(colUser)

	err = c.RemoveId(bson.ObjectIdHex(id))

	if err != nil {
		return errors.New("There was an error trying to remove the user")
	}

	return err
}
