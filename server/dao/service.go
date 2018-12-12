package dao

import (
	"docktor/server/config"
	"docktor/server/types"
	"errors"

	"github.com/globalsign/mgo/bson"
	"github.com/imdario/mergo"
)

const colService string = "services"

// GetServices get all services
func GetServices() (types.Services, error) {
	db := config.DB{}
	t := types.Services{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(colService)

	err = c.Find(bson.M{}).All(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the services")
	}

	return t, err
}

// GetServiceByID get one service by id
func GetServiceByID(id string) (types.Service, error) {
	db := config.DB{}
	t := types.Service{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(colService)

	err = c.Find(bson.M{"_id": bson.ObjectIdHex(id)}).One(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the service")
	}

	return t, err
}

// GetServiceBySubSeriveID get one service by subservice id
func GetServiceBySubSeriveID(id string) (types.Service, error) {
	db := config.DB{}
	t := types.Service{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(colService)

	err = c.Find(bson.M{"subservices._id": bson.ObjectIdHex(id)}).One(&t)

	if err != nil {
		return t, errors.New("There was an error trying to find the service")
	}

	return t, err
}

// GetSubServiceByID get one sub service by subservice id
func GetSubServiceByID(id string) (types.SubService, error) {
	db := config.DB{}
	t := types.Service{}

	s, err := db.DoDial()

	if err != nil {
		return types.SubService{}, errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(colService)

	err = c.Find(bson.M{"subservices._id": bson.ObjectIdHex(id)}).Select(bson.M{"subservices.$": 1}).One(&t)

	if err != nil {
		return types.SubService{}, errors.New("There was an error trying to find the sub service")
	}

	return t.SubServices[0], err
}

// CreateOrUpdateService create or update service
func CreateOrUpdateService(t types.Service) (types.Service, error) {
	db := config.DB{}

	s, err := db.DoDial()

	if err != nil {
		return t, errors.New("There was an error trying to connect to the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(colService)

	if err != nil {
		return t, errors.New("There was an error trying to insert the service to the DB")
	}

	for i := 0; i < len(t.SubServices); i++ {
		if !t.SubServices[i].ID.Valid() {
			t.SubServices[i].ID = bson.NewObjectId()
		}
	}

	if t.ID.Valid() {
		service, _ := GetServiceByID(t.ID.Hex())
		if err := mergo.Merge(&t, service); err != nil {
			return t, err
		}
		err = c.UpdateId(t.ID, t)
	} else {
		t.ID = bson.NewObjectId()
		err = c.Insert(t)
	}

	return t, err
}

// DeleteService remove a service by id
func DeleteService(id string) error {
	db := config.DB{}

	s, err := db.DoDial()

	if err != nil {
		return errors.New("There was an error trying to connect with the DB")
	}

	defer s.Close()

	c := s.DB(db.Name()).C(colService)

	err = c.RemoveId(bson.ObjectIdHex(id))

	if err != nil {
		return errors.New("There was an error trying to remove the service")
	}

	return err
}
