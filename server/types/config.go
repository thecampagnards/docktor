package types

// Message data
type Message struct {
	Icon    string `json:"icon,omitempty" bson:"icon,omitempty"`
	Color   string `json:"color,omitempty" bson:"color,omitempty"`
	Header  string `json:"header,omitempty" bson:"header,omitempty"`
	Content string `json:"content,omitempty" bson:"content,omitempty"`
}

// Config data
type Config struct {
	Message Message `json:"message" bson:"message"`
	Sources string  `json:"sources" bson:"sources"`
}
