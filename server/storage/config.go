package storage

import (
	"docktor/server/types"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

// ConfigRepo is the repo for config
type ConfigRepo interface {
	// Save the config into database
	Save(config types.Config) (types.Config, error)
	// Find get the config
	Find() (types.Config, error)
	// Drop drops the content of the collection
	Drop() error
	// GetCollectionName returns the name of the collection
	GetCollectionName() string
}

// DefaultConfigRepo is the repository for config
type DefaultConfigRepo struct {
	coll *mgo.Collection
}

// NewConfigRepo instantiate new RepoConfig
func NewConfigRepo(coll *mgo.Collection) ConfigRepo {
	return &DefaultConfigRepo{coll: coll}
}

// GetCollectionName gets the name of the collection
func (r *DefaultConfigRepo) GetCollectionName() string {
	return r.coll.FullName
}

// Find get the config
func (r *DefaultConfigRepo) Find() (t types.Config, err error) {
	err = r.coll.Find(nil).One(&t)
	return t, err
}

// Save create or update the config via upsert
func (r *DefaultConfigRepo) Save(t types.Config) (types.Config, error) {
	change := mgo.Change{
		Update:    bson.M{"$set": t},
		ReturnNew: true,
		Upsert:    true,
	}
	_, err := r.coll.Find(nil).Apply(change, &t)
	return t, err
}

// Drop drops the content of the collection
func (r *DefaultConfigRepo) Drop() error {
	return r.coll.DropCollection()
}
