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
	Message     Message `json:"message" bson:"message"`
	DocURL      string  `json:"doc_url" bson:"doc_url"`
	Sources     string  `json:"sources" bson:"sources"`
	MaxServices int     `json:"max_services" bson:"max_services"`
}
