package types

type Message struct {
	Icon    string `json:"icon,omitempty"`
	Color   string `json:"color,omitempty"`
	Header  string `json:"header,omitempty"`
	Content string `json:"content,omitempty"`
}
