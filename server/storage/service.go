package storage

import (
	"docktor/server/types"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

// ServicesRepo is the repo for services
type ServicesRepo interface {
	// Drop drops the content of the collection
	Drop() error
	// Save a service into database
	Save(service types.Service) (types.Service, error)
	// Delete a service in database
	Delete(id string) error
	// FindByID get the service by its id
	FindByID(id string) (types.Service, error)
	// FindByIDBson get the service by its id
	FindByIDBson(id bson.ObjectId) (types.Service, error)
	// FindBySubServiceID get the service which has this subservice id
	FindBySubServiceID(id string) (types.Service, error)
	// FindSubServiceByID get the subservice by id
	FindSubServiceByID(id string) (types.SubService, error)
	// FindSubServiceByIDBson get the subservice by bson id
	FindSubServiceByIDBson(id bson.ObjectId) (types.SubService, error)
	// FindAll get all services
	FindAll() (types.Services, error)
	// GetCollectionName returns the name of the collection
	GetCollectionName() string
	// CreateIndexes creates Index
	CreateIndexes() error
}

// DefaultServicesRepo is the repository for services
type DefaultServicesRepo struct {
	coll *mgo.Collection
}

// NewServicesRepo instantiate new ServicesRepo
func NewServicesRepo(coll *mgo.Collection) ServicesRepo {
	return &DefaultServicesRepo{coll: coll}
}

// GetCollectionName gets the name of the collection
func (r *DefaultServicesRepo) GetCollectionName() string {
	return r.coll.FullName
}

// CreateIndexes creates Index
func (r *DefaultServicesRepo) CreateIndexes() error {
	return nil
}

// FindAll get all services
func (r *DefaultServicesRepo) FindAll() (t types.Services, err error) {
	err = r.coll.Find(nil).All(&t)
	return t, err
}

// FindByID get one service by id
func (r *DefaultServicesRepo) FindByID(id string) (t types.Service, err error) {
	err = r.coll.FindId(bson.ObjectIdHex(id)).One(&t)
	return t, err
}

// FindByIDBson get one service by id
func (r *DefaultServicesRepo) FindByIDBson(id bson.ObjectId) (t types.Service, err error) {
	err = r.coll.FindId(id).One(&t)
	return t, err
}

// FindBySubServiceID get one service by subservice id
func (r *DefaultServicesRepo) FindBySubServiceID(id string) (t types.Service, err error) {
	err = r.coll.Find(bson.M{"sub_services._id": bson.ObjectIdHex(id)}).One(&t)
	return t, err
}

// FindSubServiceByID get one sub service by subservice id without file
func (r *DefaultServicesRepo) FindSubServiceByID(id string) (types.SubService, error) {
	t := types.Service{}
	err := r.coll.Find(bson.M{"sub_services._id": bson.ObjectIdHex(id)}).Select(bson.M{"sub_services.$": 1}).One(&t)
	return t.SubServices[0], err
}

// FindSubServiceByIDBson get one sub service by subservice id without file
func (r *DefaultServicesRepo) FindSubServiceByIDBson(id bson.ObjectId) (types.SubService, error) {
	t := types.Service{}
	err := r.coll.Find(bson.M{"sub_services._id": id}).Select(bson.M{"sub_services.$": 1}).One(&t)
	return t.SubServices[0], err
}

// Save create or update service
func (r *DefaultServicesRepo) Save(t types.Service) (types.Service, error) {
	for i := 0; i < len(t.SubServices); i++ {
		if !t.SubServices[i].ID.Valid() {
			t.SubServices[i].ID = bson.NewObjectId()
		}
	}
	if !t.ID.Valid() {
		t.ID = bson.NewObjectId()
	}

	change := mgo.Change{
		Update:    bson.M{"$set": t},
		ReturnNew: true,
		Upsert:    true,
	}
	_, err := r.coll.FindId(t.ID).Apply(change, &t)
	return t, err
}

// Delete remove a service by id
func (r *DefaultServicesRepo) Delete(id string) error {
	return r.coll.RemoveId(bson.ObjectId(id))
}

// Drop drops the content of the collection
func (r *DefaultServicesRepo) Drop() error {
	return r.coll.DropCollection()
}
