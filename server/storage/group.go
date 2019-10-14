package storage

import (
	"docktor/server/types"

	dockerTypes "github.com/docker/docker/api/types"
	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

// GroupsRepo is the repo for groups
type GroupsRepo interface {
	// Drop drops the content of the collection
	Drop() error
	// Save a group into database
	Save(group types.Group) (types.Group, error)
	// Delete a group in database
	Delete(id string) error
	// FindByID get the group by its id
	FindByID(id string) (types.Group, error)
	// FindByIDBson get the group by its id
	FindByIDBson(id bson.ObjectId) (types.Group, error)
	// FindByDaemonIDBson get all groups of a daemon
	FindByDaemonIDBson(id bson.ObjectId) (t types.Groups, err error)
	// FindByDaemonID get all groups of a daemon
	FindByDaemonID(id string) (t types.Groups, err error)
	// FindContainersByDaemonID get containers groups by daemon id
	FindContainersByDaemonID(id string) (c []dockerTypes.ContainerJSON, err error)
	// FindByUser get all groups of a user
	FindByUser(u types.User) (types.Groups, error)
	// FindAll get all groups
	FindAll() (types.Groups, error)
	// FindAllLight get all groups without sensitive information
	FindAllLight() (t types.GroupsLight, err error)
	// GetCollectionName returns the name of the collection
	GetCollectionName() string
	// CreateIndexes creates Index
	CreateIndexes() error
}

// DefaultGroupsRepo is the repository for groups
type DefaultGroupsRepo struct {
	coll *mgo.Collection
}

// NewGroupsRepo instantiate new GroupsRepo
func NewGroupsRepo(coll *mgo.Collection) GroupsRepo {
	return &DefaultGroupsRepo{coll: coll}
}

// GetCollectionName gets the name of the collection
func (r *DefaultGroupsRepo) GetCollectionName() string {
	return r.coll.FullName
}

// CreateIndexes creates Index
func (r *DefaultGroupsRepo) CreateIndexes() error {
	return r.coll.EnsureIndex(mgo.Index{
		Key:    []string{"name"},
		Unique: true,
		Name:   "group_name_unique",
	})
}

// FindAll get all groups
func (r *DefaultGroupsRepo) FindAll() (t types.Groups, err error) {
	err = r.coll.Find(nil).All(&t)
	return t, err
}

// FindAllLight get all groups without sensitive informations
func (r *DefaultGroupsRepo) FindAllLight() (t types.GroupsLight, err error) {
	err = r.coll.Find(nil).All(&t)
	return t, err
}

// FindByUser get all groups of a user
func (r *DefaultGroupsRepo) FindByUser(u types.User) (t types.Groups, err error) {
	err = r.coll.Find(bson.M{"$or": []bson.M{{"admins": u.Username}, {"users": u.Username}}}).All(&t)
	return t, err
}

// FindByDaemonIDBson get groups by daemon id
func (r *DefaultGroupsRepo) FindByDaemonIDBson(id bson.ObjectId) (t types.Groups, err error) {
	err = r.coll.Find(bson.M{"daemon_id": id}).All(&t)
	return t, err
}

// FindByDaemonID get groups by daemon id
func (r *DefaultGroupsRepo) FindByDaemonID(id string) (t types.Groups, err error) {
	return r.FindByDaemonIDBson(bson.ObjectIdHex(id))
}

// FindContainersByDaemonID get containers groups by daemon id
func (r *DefaultGroupsRepo) FindContainersByDaemonID(id string) (c []dockerTypes.ContainerJSON, err error) {
	err = r.coll.Pipe([]bson.M{
		{"$match": bson.M{"daemon_id": bson.ObjectIdHex(id)}},
		{"$unwind": "$containers"},
		{"$replaceRoot": bson.M{"newRoot": "$containers"}},
	}).All(&c)
	return c, err
}

// FindByID get one group by id
func (r *DefaultGroupsRepo) FindByID(id string) (t types.Group, err error) {
	err = r.coll.FindId(bson.ObjectIdHex(id)).One(&t)
	return t, err
}

// FindByIDBson get one group by id
func (r *DefaultGroupsRepo) FindByIDBson(id bson.ObjectId) (t types.Group, err error) {
	err = r.coll.FindId(id).One(&t)
	return t, err
}

// Save create or update group
func (r *DefaultGroupsRepo) Save(t types.Group) (types.Group, error) {
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

// Delete remove a group by id
func (r *DefaultGroupsRepo) Delete(id string) error {
	return r.coll.RemoveId(bson.ObjectIdHex(id))
}

// Drop drops the content of the collection
func (r *DefaultGroupsRepo) Drop() error {
	return r.coll.DropCollection()
}
