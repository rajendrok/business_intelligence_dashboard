package db

import (
	"database/sql"
	"fmt"
	"main/models"
)

func OpenDB(payload models.DBPayload) (*sql.DB, error) {
	var dsn string
	switch payload.Driver {
	case "postgres":
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=disable",
			payload.Host, payload.Username, payload.Password, payload.Database, payload.Port)
	case "mysql":
		dsn = fmt.Sprintf("%s:%s@tcp(%s:%d)/%s",
			payload.Username, payload.Password, payload.Host, payload.Port, payload.Database)
	default:
		return nil, fmt.Errorf("unsupported driver, uisng drive name %s", payload.Driver)
	}
	return sql.Open(payload.Driver, dsn)
}
