package types

// Command data
type Command struct {
	Image    string   `json:"image" bson:"image"`
	Commands []string `json:"commands" bson:"commands"`
}

// Commands data
type Commands []Command
