package storage

import (
	"time"

	"github.com/globalsign/mgo"
	log "github.com/sirupsen/logrus"
)

const mongoTimeout = 10 * time.Second

// Session stores mongo session
var session *mgo.Session

// Session is the interface for a docktor session
type Session interface {
	SetMode(consistency mgo.Mode, refresh bool)
	Close()
}

//Client is the entrypoint of Docktor API
type Client interface {
	Collections() []IsCollection
	Config() ConfigRepo
	Daemons() DaemonsRepo
	Groups() GroupsRepo
	Services() ServicesRepo
	Users() UsersRepo
	Close()
}

// IsCollection defines a Mongo collection
type IsCollection interface {
	GetCollectionName() string
}

// IsCollectionWithIndexes defines a Mongo collection that needs indexes to be created
type IsCollectionWithIndexes interface {
	IsCollection
	CreateIndexes() error
}

// Docktor is the implementation structure to use the API
// It contains API accessing to services, jobs, daemons, etc. + the open session
type Docktor struct {
	session  Session
	config   ConfigRepo
	daemons  DaemonsRepo
	groups   GroupsRepo
	services ServicesRepo
	users    UsersRepo
}

type appContext struct {
	db *mgo.Database
}

// Connect connects to mongodb
func Connect(mongoURL string) {
	log.WithField("mongoURL", mongoURL).WithField("timeout", mongoTimeout).Info("Connecting to Mongo cluster...")
	s, err := mgo.DialWithInfo(&mgo.DialInfo{
		Addrs:   []string{mongoURL},
		Timeout: mongoTimeout,
	})

	if err != nil {
		log.WithError(err).Fatal("Can't connect to mongo")
	}

	s.SetSafe(&mgo.Safe{})
	log.WithField("mongoURL", mongoURL).Info("Connecting to Mongo cluster [OK]")
	session = s
}

// Get the connexion to docktor API
func Get() (Client, error) {
	s := session.Clone()
	s.SetSafe(&mgo.Safe{})
	database := s.DB("docktor")

	context := appContext{database}

	return &Docktor{
		config:   NewConfigRepo(context.db.C("config")),
		daemons:  NewDaemonsRepo(context.db.C("daemons")),
		groups:   NewGroupsRepo(context.db.C("groups")),
		services: NewServicesRepo(context.db.C("services")),
		users:    NewUsersRepo(context.db.C("users")),
		session:  s,
	}, nil
}

// Close the connexion to docktor API
func (dock *Docktor) Close() {
	dock.session.Close()
}

// Config is the entrypoint for Config API
func (dock *Docktor) Config() ConfigRepo {
	return dock.config
}

// Daemons is the entrypoint for Daemons API
func (dock *Docktor) Daemons() DaemonsRepo {
	return dock.daemons
}

// Groups is the entrypoint for Groups API
func (dock *Docktor) Groups() GroupsRepo {
	return dock.groups
}

// Services is the entrypoint for Daemons API
func (dock *Docktor) Services() ServicesRepo {
	return dock.services
}

// Users is the entrypoint for Users API
func (dock *Docktor) Users() UsersRepo {
	return dock.users
}

// Collections returns all available collections in Docktor
func (dock *Docktor) Collections() []IsCollection {
	return []IsCollection{
		dock.config,
		dock.daemons,
		dock.groups,
		dock.services,
		dock.users,
	}
}
