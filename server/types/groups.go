package types

import (
	"fmt"
	"reflect"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/libcompose/config"
	"github.com/globalsign/mgo/bson"
	yaml "gopkg.in/yaml.v3"
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

// GroupService data
type GroupService struct {
	SubServiceID bson.ObjectId     `json:"sub_service_id,omitempty" bson:"sub_service_id,omitempty"`
	Name         string            `json:"name" bson:"name" validate:"required"`
	File         []byte            `json:"file,omitempty"  bson:"file" validate:"required"`
	Variables    []ServiceVariable `json:"variables" bson:"variables"`
	URL          string            `json:"url" bson:"url" validate:"required"`
	AutoUpdate   bool              `json:"auto_update" bson:"auto_update"`
	Ports        []uint16          `json:"ports" bson:"ports"`
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

// FindServiceByName return the service by name (unique)
func (g *Group) FindServiceByName(name string) *GroupService {
	for _, service := range g.Services {
		if service.Name == name {
			return &service
		}
	}
	return nil
}

// FindContainersByNameOrID return the group containers by id or name and keep the array key
func (g *GroupDocker) FindContainersByNameOrID(containers []string) (cont []types.ContainerJSON) {
	cont = make([]types.ContainerJSON, len(g.Containers))
	for _, container := range containers {
		for key, c := range g.Containers {
			if c.ID == container || c.Name == container {
				cont[key] = c
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

// ConvertToGroupService this function convert a sub service to a service group
func (ss *SubService) ConvertToGroupService(serviceName string, daemon Daemon, service Service, group Group, autoUpdate bool) (groupService GroupService, err error) {

	groupService.Name = serviceName
	groupService.Variables = ss.Variables
	groupService.SubServiceID = ss.ID
	groupService.URL = computeServiceURL(serviceName, group.Name, daemon.Host)

	variables := map[string]interface{}{
		"Group":       group,
		"Daemon":      daemon,
		"Service":     service,
		"ServiceName": serviceName,
	}

	// Copy of variables
	for _, v := range ss.Variables {
		variables[v.Name] = v.Value
	}

	serv, err := ss.ConvertSubService(variables)
	if err != nil {
		return groupService, fmt.Errorf("Error when converting sub service: %s", err)
	}

	var config config.Config
	if err = yaml.Unmarshal(serv, &config); err != nil {
		return groupService, fmt.Errorf("Error when unmarshal service: %s", err)
	}

	addLabel(&config, SERVICE_NAME_LABEL, serviceName)

	// Use https://github.com/v2tec/watchtower
	addLabel(&config, WATCHTOWER_LABEL, fmt.Sprintf("%v", autoUpdate))
	groupService.AutoUpdate = autoUpdate

	groupService.File, err = yaml.Marshal(config)
	if err != nil {
		return groupService, fmt.Errorf("Error when marshal config: %s", err)
	}

	return groupService, nil
}

// Obfuscate hides compose file and secret variables
func (g *Group) Obfuscate() {
	for i, s := range g.Services {
		g.Services[i].File = []byte{}
		for j, v := range s.Variables {
			if v.Secret {
				g.Services[i].Variables[j].Value = SECRET_VARIABLE
			}
		}
	}
}

func addLabel(config *config.Config, label string, value string) {
	for key := range config.Services {

		labels := reflect.ValueOf(config.Services[key]["labels"])

		if !labels.IsValid() {
			labels = reflect.MakeMap(reflect.MapOf(reflect.TypeOf(label), reflect.TypeOf(value)))
		}

		labels.SetMapIndex(reflect.ValueOf(label), reflect.ValueOf(value))
		config.Services[key]["labels"] = labels.Interface()
	}
}

func computeServiceURL(serviceName, groupName, host string) string {
	service := strings.ReplaceAll(serviceName, "[_-]", "")
	service = strings.ToLower(service)
	group := strings.ReplaceAll(groupName, "_", "-")
	group = strings.ToLower(group)

	return fmt.Sprintf("https://%s.%s.%s/", service, group, host)
}
