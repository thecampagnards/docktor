package storage

import (
	"docktor/server/types"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

// UsersRepo is the repo for users
type UsersRepo interface {
	// Drop drops the content of the collection
	Drop() error
	// Save a user into database
	Save(user types.User) (types.User, error)
	// Delete a user in database
	Delete(username string) error
	// FindByID get the user by its id
	FindByUsername(username string) (types.User, error)
	// FindAll get all users
	FindAll() (types.Users, error)
	// FindAllWithGroups get all users with their groups
	FindAllWithGroups() (types.Profiles, error)
	// GetCollectionName returns the name of the collection
	GetCollectionName() string
	// CreateIndexes creates Index
	CreateIndexes() error
}

// DefaultUsersRepo is the repository for users
type DefaultUsersRepo struct {
	coll *mgo.Collection
}

// NewUsersRepo instantiate new UsersRepo
func NewUsersRepo(coll *mgo.Collection) UsersRepo {
	return &DefaultUsersRepo{coll: coll}
}

// GetCollectionName gets the name of the collection
func (r *DefaultUsersRepo) GetCollectionName() string {
	return r.coll.FullName
}

// CreateIndexes creates Index
func (r *DefaultUsersRepo) CreateIndexes() error {
	return r.coll.EnsureIndex(mgo.Index{
		Key:    []string{"username"},
		Unique: true,
		Name:   "users_username_unique",
	})
}

// FindAll get all users
func (r *DefaultUsersRepo) FindAll() (t types.Users, err error) {
	err = r.coll.Find(nil).All(&t)
	return t, err
}

// FindAllWithGroups get all users
func (r *DefaultUsersRepo) FindAllWithGroups() (t types.Profiles, err error) {
	err = r.coll.Pipe([]bson.M{
		{"$lookup": bson.M{
			"from":         types.GROUPS_DB_COLUMN,
			"localField":   "username",
			"foreignField": "users",
			"as":           "groupsuser",
		}},
		{"$lookup": bson.M{
			"from":         types.GROUPS_DB_COLUMN,
			"localField":   "username",
			"foreignField": "admins",
			"as":           "groupsadmin",
		}},
		{"$project": bson.M{
			"username":  1,
			"firstname": 1,
			"lastname":  1,
			"email":     1,
			"role":      1,
			"groups": bson.M{
				"$concatArrays": []string{"$groupsadmin", "$groupsuser"},
			}}},
	}).All(&t)
	return
}

// FindByUsername get one user by username
func (r *DefaultUsersRepo) FindByUsername(username string) (t types.User, err error) {
	err = r.coll.Find(bson.M{"username": username}).One(&t)
	return t, err
}

// Save create or update user
func (r *DefaultUsersRepo) Save(t types.User) (types.User, error) {
	change := mgo.Change{
		Update:    bson.M{"$set": t},
		ReturnNew: true,
		Upsert:    true,
	}
	_, err := r.coll.Find(bson.M{"username": t.Username}).Apply(change, &t)
	return t, err
}

// Delete remove a user by username
func (r *DefaultUsersRepo) Delete(username string) error {
	_, err := r.coll.UpdateAll(
		bson.M{"admins": username},
		bson.M{"$pull": bson.M{"admins": username}},
	)
	if err != nil {
		return err
	}
	_, err = r.coll.UpdateAll(
		bson.M{"users": username},
		bson.M{"$pull": bson.M{"users": username}},
	)
	if err != nil {
		return err
	}
	return r.coll.Remove(bson.M{"username": username})
}

// Drop drops the content of the collection
func (r *DefaultUsersRepo) Drop() error {
	return r.coll.DropCollection()
}
