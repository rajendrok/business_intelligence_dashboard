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

type DBCredential struct {
	Host     string `json:"host"`
	Port     int    `json:"port"`
	User     string `json:"user"`
	Password string `json:"password"`
	Database string `json:"database"`
}

type Source struct {
	SourceID    string    `json:"source_id"`
	Type        string    `json:"type"`        // database or excel
	Table       string    `json:"table"`       // only for databases
	FileID      string    `json:"file_id"`     // only for excel
	Credentials DBPayload `json:"credentials"` // use your existing struct
}

type JoinConfig struct {
	LeftSource  string `json:"left_source"`
	RightSource string `json:"right_source"`
	LeftColumn  string `json:"left_source_column"`
	RightColumn string `json:"right_source_column"`
	Type        string `json:"type"`
}

type JoinRequest struct {
	Sources []Source     `json:"sources"`
	Joins   []JoinConfig `json:"joins"`
}
