package db

import (
	"database/sql"
	"fmt"
	"main/models"
)

type SchemaResult struct {
	Tables map[string][]string `json:"tables"`
	Views  map[string][]string `json:"views"`
}

func FetchSchema(db *sql.DB, payload models.DBPayload) (*SchemaResult, error) {
	driver := payload.Driver
	database := payload.Database
	tableNames, err := getTableNames(db, driver, database)
	if err != nil {
		return nil, err
	}

	schema := &SchemaResult{
		Tables: make(map[string][]string),
		Views:  make(map[string][]string),
	}

	for _, table := range tableNames["tables"] {
		cols, err := getColumnNames(db, table, driver)
		if err != nil {
			return nil, err
		}
		schema.Tables[table] = cols
	}

	for _, view := range tableNames["views"] {
		cols, err := getColumnNames(db, view, driver)
		if err != nil {
			return nil, err
		}
		schema.Views[view] = cols
	}

	return schema, nil
}

func getTableNames(db *sql.DB, driver, database string) (map[string][]string, error) {
	result := map[string][]string{
		"tables": {},
		"views":  {},
	}

	var rows *sql.Rows
	var err error

	switch driver {
	case "mysql":
		rows, err = db.Query(`SELECT TABLE_NAME, TABLE_TYPE FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`, database)
	case "postgres":
		rows, err = db.Query(`SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public'`)
	default:
		return nil, fmt.Errorf("unsupported driver: %s", driver)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var name, ttype string
		if err := rows.Scan(&name, &ttype); err != nil {
			return nil, err
		}
		switch ttype {
		case "BASE TABLE":
			result["tables"] = append(result["tables"], name)
		case "VIEW":
			result["views"] = append(result["views"], name)
		}
	}
	return result, nil
}

func getColumnNames(db *sql.DB, table, driver string) ([]string, error) {
	var rows *sql.Rows
	var err error

	switch driver {
	case "postgres":
		rows, err = db.Query(`SELECT column_name FROM information_schema.columns WHERE table_name=$1`, table)
	case "mysql":
		rows, err = db.Query(`SHOW COLUMNS FROM ` + table)
	default:
		return nil, fmt.Errorf("unsupported driver: %s", driver)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cols []string
	for rows.Next() {
		switch driver {
		case "postgres":
			var col string
			if err := rows.Scan(&col); err != nil {
				return nil, err
			}
			cols = append(cols, col)
		case "mysql":
			var field, t, n, k, e string
			var d sql.NullString
			if err := rows.Scan(&field, &t, &n, &k, &d, &e); err != nil {
				return nil, err
			}
			cols = append(cols, field)
		}
	}
	return cols, nil
}
