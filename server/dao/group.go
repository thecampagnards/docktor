package dao

import (
	"errors"

	"docktor/server/config"
	"docktor/server/types"

	"github.com/globalsign/mgo/bson"
	"github.com/imdario/mergo"
)

var groupRestRequest = []bson.M{
	bson.M{"$lookup": bson.M{
		"from":         types.DAEMONS_DB_COLUMN,
		"localField":   "daemonid",
		"foreignField": "_id",
		"as":           "daemondata",
	}},
	bson.M{"$unwind": bson.M{
		"path": "$daemondata",
		"preserveNullAndEmptyArrays": true,
	}},
	bson.M{"$lookup": bson.M{
		"from":         types.USERS_DB_COLUMN,
		"localField":   "users",
		"foreignField": "attributes.username",
		"as":           "usersdata",
	}},
	bson.M{"$lookup": bson.M{
		"from":         types.USERS_DB_COLUMN,
		"localField":   "admins",
		"foreignField": "attributes.username",
		"as":           "adminsdata",
	}},
	bson.M{"$project": bson.M{
		"daemondata.ssh":         0,
		"daemondata.docker":      0,
		"daemondata.cadvisor":    0,
		"daemondata.description": 0,
		"adminsdata.password":    0,
		"adminsdata.salt":        0,
		"usersdata.password":     0,
		"usersdata.salt":         0,
	}},
}

// GetGroups get all groups
func GetGroups() (types.Groups, error) {
	db := config.DB{}
	t := types.Groups{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(types.GROUPS_DB_COLUMN)

	err = c.Find(bson.M{}).All(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the groups")
	}

	return t, err
}

// GetGroupsRest get all groups with daemons, users and admins
func GetGroupsRest() (types.GroupsRest, error) {
	db := config.DB{}
	t := types.GroupsRest{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(types.GROUPS_DB_COLUMN)

	err = c.Pipe(groupRestRequest).All(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the groups")
	}

	return t, err
}

// GetGroupRestByID get one group by id with daemon, users and admins
func GetGroupRestByID(id string) (types.GroupRest, error) {
	db := config.DB{}
	t := types.GroupRest{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(types.GROUPS_DB_COLUMN)

	customRequest := append([]bson.M{bson.M{"$match": bson.M{"_id": bson.ObjectIdHex(id)}}}, groupRestRequest...)

	err = c.Pipe(customRequest).One(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the group")
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

	c := s.DB(db.Name()).C(types.GROUPS_DB_COLUMN)

	err = c.FindId(bson.ObjectIdHex(id)).One(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the group")
	}

	return t, err
}

// CreateOrUpdateGroup create or update group
func CreateOrUpdateGroup(t types.Group, merge bool) (types.Group, error) {
	db := config.DB{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect to the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(types.GROUPS_DB_COLUMN)

	if err != nil {
		return t, errors.New("There was an error trying to insert the group to the DB")
	}

	if t.ID.Valid() {
		if merge {
			group, _ := GetGroupByID(t.ID.Hex())
			if err := mergo.Merge(&t, group); err != nil {
				return t, err
			}
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

	c := s.DB(db.Name()).C(types.GROUPS_DB_COLUMN)

	err = c.RemoveId(bson.ObjectIdHex(id))

	if err != nil {
		return errors.New("There was an error trying to remove the group")
	}

	return err
}
