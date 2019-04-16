package storage

import (
	"docktor/server/types"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

// DaemonsRepo is the repo for daemons
type DaemonsRepo interface {
	// Save a daemon into database
	Save(daemon types.Daemon) (types.Daemon, error)
	// Delete a daemon in database
	Delete(id string) error
	// Find get the daemon by its ids
	Find(ids []bson.ObjectId) (types.DaemonsLight, error)
	// FindByID get the daemon by its id
	FindByID(id string) (types.Daemon, error)
	// FindByIDBson get the daemon by its (bson representation)
	FindByIDBson(id bson.ObjectId) (types.Daemon, error)
	// FindAllLight gets all the daemons without sensibles data
	FindAllLight() (t types.DaemonsLight, err error)
	// FindAll get all daemons
	FindAll() (types.Daemons, error)
	// Drop drops the content of the collection
	Drop() error
	// GetCollectionName returns the name of the collection
	GetCollectionName() string
}

// DefaultDaemonsRepo is the repository for daemons
type DefaultDaemonsRepo struct {
	coll *mgo.Collection
}

// NewDaemonsRepo instantiate new RepoDaemons
func NewDaemonsRepo(coll *mgo.Collection) DaemonsRepo {
	return &DefaultDaemonsRepo{coll: coll}
}

// CreateIndexes creates Index
func (r *DefaultDaemonsRepo) CreateIndexes() error {
	err := r.coll.EnsureIndex(mgo.Index{
		Key:    []string{"name"},
		Unique: true,
		Name:   "daemon_name_unique",
	})
	if err != nil {
		return err
	}
	return r.coll.EnsureIndex(mgo.Index{
		Key:    []string{"host", "docker.port"},
		Unique: true,
		Name:   "daemon_host_port_unique",
	})
}

// GetCollectionName gets the name of the collection
func (r *DefaultDaemonsRepo) GetCollectionName() string {
	return r.coll.FullName
}

// FindAll get all daemons
func (r *DefaultDaemonsRepo) FindAll() (t types.Daemons, err error) {
	err = r.coll.Find(nil).All(&t)
	return t, err
}

// Find get all daemons
func (r *DefaultDaemonsRepo) Find(ids []bson.ObjectId) (t types.DaemonsLight, err error) {
	err = r.coll.Find(bson.M{"_id": bson.M{"$in": ids}}).All(&t)
	return t, err
}

// FindAllLight get all daemons
func (r *DefaultDaemonsRepo) FindAllLight() (t types.DaemonsLight, err error) {
	err = r.coll.Find(nil).All(&t)
	return t, err
}

// FindByID get one daemon by id
func (r *DefaultDaemonsRepo) FindByID(id string) (t types.Daemon, err error) {
	err = r.coll.FindId(bson.ObjectIdHex(id)).One(&t)
	return t, err
}

// FindByIDBson get one daemon by bson id
func (r *DefaultDaemonsRepo) FindByIDBson(id bson.ObjectId) (t types.Daemon, err error) {
	err = r.coll.FindId(id).One(&t)
	return t, err
}

// Save create or update daemon via upsert
func (r *DefaultDaemonsRepo) Save(t types.Daemon) (types.Daemon, error) {
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

// Delete remove a daemon by id
func (r *DefaultDaemonsRepo) Delete(id string) error {
	return r.coll.RemoveId(bson.ObjectId(id))
}

// Drop drops the content of the collection
func (r *DefaultDaemonsRepo) Drop() error {
	return r.coll.DropCollection()
}
