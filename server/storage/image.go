package storage

import (
	"docktor/server/types"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

// ImagesRepo is the repo for images
type ImagesRepo interface {
	// Drop drops the content of the collection
	Drop() error
	// Save a image into database
	Save(image types.Image) (types.Image, error)
	// Delete a image in database
	Delete(name string) error
	// Find get the image by name
	Find(name string) (types.Images, error)
	// FindByID get the image by id
	FindByID(id string) (types.Image, error)
	// FindCommandByID get the command by id
	FindCommandByID(id string) (types.Command, error)
	// FindAll get all images
	FindAll() (types.Images, error)
	// GetCollectionName returns the name of the collection
	GetCollectionName() string
	// CreateIndexes creates Index
	CreateIndexes() error
}

// DefaultImagesRepo is the repository for images
type DefaultImagesRepo struct {
	coll *mgo.Collection
}

// NewImagesRepo instantiate new ImagesRepo
func NewImagesRepo(coll *mgo.Collection) ImagesRepo {
	return &DefaultImagesRepo{coll: coll}
}

// GetCollectionName gets the name of the collection
func (r *DefaultImagesRepo) GetCollectionName() string {
	return r.coll.FullName
}

// CreateIndexes creates Index
func (r *DefaultImagesRepo) CreateIndexes() error {
	return r.coll.EnsureIndex(mgo.Index{
		Key:    []string{"image"},
		Unique: true,
		Name:   "image_image_unique",
	})
}

// FindAll get all images
func (r *DefaultImagesRepo) FindAll() (t types.Images, err error) {
	err = r.coll.Find(nil).All(&t)
	return t, err
}

// Find get images by regex
func (r *DefaultImagesRepo) Find(image string) (t types.Images, err error) {
	// err = r.coll.Find(bson.JavaScript{Code: fmt.Sprintf("return this.image.test('%s');", image)}).All(&t)
	err = r.coll.Find(nil).All(&t)
	return t, err
}

// FindByID get one image by id
func (r *DefaultImagesRepo) FindByID(id string) (t types.Image, err error) {
	err = r.coll.FindId(bson.ObjectIdHex(id)).One(&t)
	return t, err
}

// FindCommandByID get one command by id
func (r *DefaultImagesRepo) FindCommandByID(id string) (types.Command, error) {
	var img types.Image
	err := r.coll.Find(bson.M{"commands._id": bson.ObjectIdHex(id)}).Select(bson.M{"commands.$": 1}).One(&img)
	if !img.ID.Valid() {
		return types.Command{}, err
	}
	return img.Commands[0], nil
}

// Save create or update image
func (r *DefaultImagesRepo) Save(t types.Image) (types.Image, error) {
	if !t.ID.Valid() {
		t.ID = bson.NewObjectId()
	}

	for i, c := range t.Commands {
		if !c.ID.Valid() {
			t.Commands[i].ID = bson.NewObjectId()
		}
	}

	change := mgo.Change{
		Update:    bson.M{"$set": t},
		ReturnNew: true,
		Upsert:    true,
	}
	_, err := r.coll.FindId(t.ID).Apply(change, &t)
	return t, err
}

// Delete remove a image by image
func (r *DefaultImagesRepo) Delete(image string) error {
	return r.coll.Remove(bson.M{"image": image})
}

// Drop drops the content of the collection
func (r *DefaultImagesRepo) Drop() error {
	return r.coll.DropCollection()
}
