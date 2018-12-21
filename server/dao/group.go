package dao

import (
	"errors"

	"docktor/server/config"
	"docktor/server/types"

	"github.com/globalsign/mgo/bson"
	"github.com/imdario/mergo"
)

const colGroup string = "groups"

// GetGroups get all groups
func GetGroups() (types.Groups, error) {
	db := config.DB{}
	t := types.Groups{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(colGroup)

	err = c.Find(bson.M{}).All(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the groups")
	}

	return t, err
}

// GetAdminGroupsOfUser get all admin groups of user
func GetAdminGroupsOfUser(u types.User) (types.Groups, error) {
	db := config.DB{}
	t := types.Groups{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(colGroup)

	err = c.Find(bson.M{"$in": bson.M{"admins": u.Username}}).All(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the groups")
	}

	return t, err
}

// GetGroupByID get one group by id
func GetGroupByID(id string) (types.Group, error) {
	db := config.DB{}
	t := types.Group{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(colGroup)

	err = c.FindId(bson.ObjectIdHex(id)).One(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the deaemon")
	}

	return t, err
}

// CreateOrUpdateGroup create or update group
func CreateOrUpdateGroup(t types.Group) (types.Group, error) {
	db := config.DB{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect to the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(colGroup)

	if err != nil {
		return t, errors.New("There was an error trying to insert the group to the DB")
	}

	if t.ID.Valid() {
		group, _ := GetGroupByID(t.ID.Hex())
		if err := mergo.Merge(&t, group); err != nil {
			return t, err
		}
		err = c.UpdateId(t.ID, t)
	} else {
		t.ID = bson.NewObjectId()
		err = c.Insert(t)
	}

	return t, err
}

// DeleteGroup remove a group by id
func DeleteGroup(id string) error {
	db := config.DB{}

	s, err := db.DoDial()

	if err != nil {
		return errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(colGroup)

	err = c.RemoveId(bson.ObjectIdHex(id))

	if err != nil {
		return errors.New("There was an error trying to remove the group")
	}

	return err
}
