package types

import (
	"github.com/docker/docker/api/types"
	"github.com/docker/libcompose/config"
	"github.com/globalsign/mgo/bson"
	log "github.com/sirupsen/logrus"
	yaml "gopkg.in/yaml.v2"
)

// GroupLight data
type GroupLight struct {
	ID          bson.ObjectId `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string        `json:"name" bson:"name" validate:"required"`
	Description string        `json:"description" bson:"description"`
	Daemon      bson.ObjectId `json:"daemon_id,omitempty" bson:"daemon_id,omitempty"`
	Admins      []string      `json:"admins" bson:"admins"`
	Users       []string      `json:"users" bson:"users"`
}

// Group data
type Group struct {
	GroupLight  `bson:",inline"`
	Services    []GroupService `json:"services" bson:"services"`
	GroupDocker `bson:",inline"`
}

// GroupDocker data
type GroupDocker struct {
	Subnet     string                `json:"subnet" bson:"subnet"`
	MinPort    uint16                `json:"min_port" bson:"min_port"`
	MaxPort    uint16                `json:"max_port" bson:"max_port"`
	Containers []types.ContainerJSON `json:"containers" bson:"containers"`
}

// ServiceGroup data
type ServiceGroup struct {
	SubServiceID bson.ObjectId          `json:"_id,omitempty" bson:"_id,omitempty"`
	Variables    map[string]interface{} `json:"variables,omitempty" bson:"variables"`
	AutoUpdate   bool                   `json:"auto_update" bson:"auto_update"`
	Ports        []uint16               `json:"ports" bson:"ports"`
}

// Groups data
type Groups []Group

// GroupsLight data
type GroupsLight []GroupLight

// IsAdmin check if a user is admin in this group
func (g *Group) IsAdmin(u *User) bool {

	if u.IsAdmin() {
		return true
	}

	for _, admin := range g.Admins {
		if admin == u.Username {
			return true
		}
	}
	return false
}

// IsMyGroup check if this is a group of the user
func (g *Group) IsMyGroup(u *User) bool {

	if g.IsAdmin(u) {
		return true
	}

	for _, user := range g.Users {
		if user == u.Username {
			return true
		}
	}
	return false
}

// GetFreePort return the first available port
func (g *Group) GetFreePort() uint16 {

	var ports []uint16
	/*
		for _, s := range g.Services {
			ports = append(ports, s.Ports...)
		}
	*/
	for i := g.MinPort; i < g.MaxPort; i++ {
		if !findPort(i, ports) {
			return i
		}
	}

	return 0
}

func findPort(port uint16, ports []uint16) bool {
	for _, p := range ports {
		if port == p {
			return true
		}
	}
	return false
}

// FindContainersByNameOrID return the group containers by id or name
func (g *GroupDocker) FindContainersByNameOrID(containers []string) (cont []types.ContainerJSON) {
	for _, container := range containers {
		for _, c := range g.Containers {
			if c.ID == container || c.Name == container {
				cont = append(cont, c)
				break
			}
		}
	}
	return
}

// AppendOrUpdate append container if doesn't exist or update it by name
func (g *GroupDocker) AppendOrUpdate(containers []types.ContainerJSON) {
	for _, container := range containers {
		exist := false
		for key, c := range g.Containers {
			if c.Name == container.Name {
				exist = true
				g.Containers[key] = container
				break
			}
		}
		if !exist {
			g.Containers = append(g.Containers, container)
		}
	}
}

// FindSubServiceByID return the subservice by string id
func (g *Group) FindSubServiceByID(subServiceID string) *GroupService {
	for _, s := range g.Services {
		if s.SubServiceID.Hex() == subServiceID {
			return &s
		}
	}
	return nil
}

// GetComposeService this function retrun the subservice compose file
func (g *Group) GetComposeService(daemon Daemon, subService SubService, serviceGroup GroupService) (service []byte, err error) {

	variables := map[string]interface{}{
		"Group":  g,
		"Daemon": daemon,
	}

	// Copy of variables
	for _, v := range serviceGroup.Variables {
		variables[v.Name] = v.Value
	}

	service, err = subService.ConvertSubService(variables)
	if err != nil {
		log.WithFields(log.Fields{
			"serviceGroup":   serviceGroup.Variables,
			"subServiceName": subService.Name,
			"groupName":      g.Name,
			"daemonHost":     daemon.Host,
			"variables":      serviceGroup.Variables,
			"error":          err,
		}).Error("Error when converting sub service")
		return
	}

	var config config.Config
	if err = yaml.Unmarshal(service, &config); err != nil {
		log.WithFields(log.Fields{
			"service": string(service),
			"error":   err,
		}).Error("Error when unmarshal service")
		return
	}
	/*
		if serviceGroup.AutoUpdate {
			// Use https://github.com/v2tec/watchtower
			log.WithFields(log.Fields{
				"config": config,
			}).Infof("Add auto update for %s with watchtower", subService.Name)
			for key := range config.Services {
				if labels, ok := config.Services[key]["labels"]; ok {
					v := reflect.ValueOf(labels)
					config.Services[key]["labels"] = reflect.Append(v, reflect.ValueOf(WATCHTOWER_LABEL)).Interface()
				} else {
					config.Services[key]["labels"] = []string{WATCHTOWER_LABEL}
				}
			}
			log.WithFields(log.Fields{
				"config": config,
			}).Infof("Configuration updated for %s", subService.Name)
		}
	*/
	service, err = yaml.Marshal(config)
	if err != nil {
		log.WithFields(log.Fields{
			"config": config,
			"error":  err,
		}).Error("Error when marshal config")
		return
	}

	log.WithFields(log.Fields{
		"service": string(service),
	}).Info("Sub service converted")

	return
}
