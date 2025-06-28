package models

type DBPayload struct {
	Username string              `json:"username"`
	Password string              `json:"password"`
	Host     string              `json:"host"`
	Port     int                 `json:"port"`
	Database string              `json:"database"`
	Driver   string              `json:"driver"`
	Tables   map[string][]string `json:"tables"`
	Limit    int                 `json:"limit"`
	Offset   int                 `json:"offset"`
	Query    string              `json:"query"`
}
