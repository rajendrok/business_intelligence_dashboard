package db

import (
	"database/sql"
	"fmt"
	"main/models"
	"strings"
)

func FetchTables(db *sql.DB, payload models.DBPayload) (map[string][]map[string]interface{}, error) {
	result := make(map[string][]map[string]interface{})
	for table, cols := range payload.Tables {
		rows, err := FetchTableData(db, table, payload.Limit, payload.Offset, payload.Driver, cols)
		if err != nil {
			return nil, err
		}
		result[table] = rows
	}
	return result, nil
}

func FetchTableData(db *sql.DB, table string, limit, offset int, driver string, columns []string) ([]map[string]interface{}, error) {
	selectCols := "*"
	if len(columns) > 0 {
		selectCols = strings.Join(columns, ", ")
	}
	query := fmt.Sprintf("SELECT %s FROM %s LIMIT %d OFFSET %d", selectCols, table, limit, offset)
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	cols, _ := rows.ColumnTypes()
	var results []map[string]interface{}

	for rows.Next() {
		vals := make([]interface{}, len(cols))
		for i := range vals {
			vals[i] = new(interface{})
		}
		_ = rows.Scan(vals...)
		row := make(map[string]interface{})
		for i, col := range cols {
			val := *(vals[i].(*interface{}))
			if b, ok := val.([]byte); ok {
				row[col.Name()] = string(b)
			} else {
				row[col.Name()] = val
			}
		}
		results = append(results, row)
	}
	return results, nil
}

func RunCustomQuery(db *sql.DB, query string) ([]map[string]interface{}, error) {
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	cols, _ := rows.ColumnTypes()
	var results []map[string]interface{}

	for rows.Next() {
		vals := make([]interface{}, len(cols))
		for i := range vals {
			vals[i] = new(interface{})
		}
		_ = rows.Scan(vals...)
		row := make(map[string]interface{})
		for i, col := range cols {
			val := *(vals[i].(*interface{}))
			if b, ok := val.([]byte); ok {
				row[col.Name()] = string(b)
			} else {
				row[col.Name()] = val
			}
		}
		results = append(results, row)
	}
	return results, nil
}

func IsSelectQuery(q string) bool {
	q = strings.TrimSpace(strings.ToUpper(q))
	return strings.HasPrefix(q, "SELECT")
}
