package storage

import (
	"docktor/server/types"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

// CommandsRepo is the repo for commands
type CommandsRepo interface {
	// Drop drops the content of the collection
	Drop() error
	// Save a command into database
	Save(command types.Command) (types.Command, error)
	// Delete a command in database
	Delete(name string) error
	// FindByImage get the command by name
	FindByImage(id string) (types.Command, error)
	// FindAll get all commands
	FindAll() (types.Commands, error)
	// GetCollectionName returns the name of the collection
	GetCollectionName() string
	// CreateIndexes creates Index
	CreateIndexes() error
}

// DefaultCommandsRepo is the repository for commands
type DefaultCommandsRepo struct {
	coll *mgo.Collection
}

// NewCommandsRepo instantiate new CommandsRepo
func NewCommandsRepo(coll *mgo.Collection) CommandsRepo {
	return &DefaultCommandsRepo{coll: coll}
}

// GetCollectionName gets the name of the collection
func (r *DefaultCommandsRepo) GetCollectionName() string {
	return r.coll.FullName
}

// CreateIndexes creates Index
func (r *DefaultCommandsRepo) CreateIndexes() error {
	return r.coll.EnsureIndex(mgo.Index{
		Key:    []string{"image"},
		Unique: true,
		Name:   "command_image_unique",
	})
}

// FindAll get all commands
func (r *DefaultCommandsRepo) FindAll() (t types.Commands, err error) {
	err = r.coll.Find(nil).All(&t)
	return t, err
}

// FindByImage get one command by id
func (r *DefaultCommandsRepo) FindByImage(image string) (t types.Command, err error) {
	err = r.coll.Find(bson.M{"image": image}).One(&t)
	return t, err
}

// Save create or update command
func (r *DefaultCommandsRepo) Save(t types.Command) (types.Command, error) {

	change := mgo.Change{
		Update:    bson.M{"$set": t},
		ReturnNew: true,
		Upsert:    true,
	}
	_, err := r.coll.Find(bson.M{"image": t.Image}).Apply(change, &t)
	return t, err
}

// Delete remove a command by image
func (r *DefaultCommandsRepo) Delete(image string) error {
	return r.coll.Remove(bson.M{"image": image})
}

// Drop drops the content of the collection
func (r *DefaultCommandsRepo) Drop() error {
	return r.coll.DropCollection()
}
