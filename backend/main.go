package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
)

type DBPayload struct {
	Username string              `json:"username"`
	Password string              `json:"password"`
	Host     string              `json:"host"`
	Port     int                 `json:"port"`
	Database string              `json:"database"`
	Driver   string              `json:"driver"` // "postgres" or "mysql"
	Tables   map[string][]string `json:"tables"` // Table -> columns (empty means all columns)
	Limit    int                 `json:"limit"`
	Offset   int                 `json:"offset"`
	Query    string              `json:"query"`
}

func main() {
	r := gin.Default()
	r.Use(CORSMiddleware())
	r.POST("/db-schema", handleDBSchema)
	r.POST("/table-data", handleFetchTableData)
	r.POST("/custom-query", handleCustomQuery)

	r.Run(":8080")
}
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With")
		c.Header("Access-Control-Expose-Headers", "Content-Disposition")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}
		c.Next()
	}
}

func handleFetchTableData(c *gin.Context) {
	var payload DBPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db, err := openDB(payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer db.Close()

	result := make(map[string][]map[string]interface{})
	for table, columns := range payload.Tables {
		rows, err := fetchTableData(db, table, payload.Limit, payload.Offset, payload.Driver, columns)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
				"table": table,
			})
			return
		}
		result[table] = rows
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}
func fetchTableData(db *sql.DB, table string, limit, offset int, driver string, columns []string) ([]map[string]interface{}, error) {
	if !isValidIdentifier(table) {
		return nil, fmt.Errorf("invalid table name")
	}

	selectCols := "*"
	if len(columns) > 0 {
		for _, col := range columns {
			if !isValidIdentifier(col) {
				return nil, fmt.Errorf("invalid column name: %s", col)
			}
		}
		selectCols = strings.Join(columns, ", ")
	}

	var query string
	switch driver {
	case "postgres", "mysql":
		query = fmt.Sprintf(`SELECT %s FROM %s LIMIT %d OFFSET %d`, selectCols, table, limit, offset)
	default:
		return nil, fmt.Errorf("unsupported driver: %s", driver)
	}

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	colTypes, err := rows.ColumnTypes()
	if err != nil {
		return nil, err
	}

	var results []map[string]interface{}
	for rows.Next() {
		values := make([]interface{}, len(colTypes))
		for i := range values {
			values[i] = new(interface{})
		}

		if err := rows.Scan(values...); err != nil {
			return nil, err
		}

		row := make(map[string]interface{})
		for i, col := range colTypes {
			val := *(values[i].(*interface{}))
			if b, ok := val.([]byte); ok {
				row[col.Name()] = string(b)
			} else {
				row[col.Name()] = val
			}
		}
		results = append(results, row)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return results, nil
}

func isValidIdentifier(name string) bool {
	re := regexp.MustCompile(`^[a-zA-Z_][a-zA-Z0-9_]*$`)
	return re.MatchString(name)
}

func handleDBSchema(c *gin.Context) {
	var payload DBPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	printLog("Received Payload", payload)

	db, err := openDB(payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer db.Close()
	printLog("Database connected successfully.", payload.Database)

	tableNames, err := getTableNames(db, payload.Driver, payload.Database)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	printLog("Fetched table and view names.", tableNames)

	result := map[string]map[string][]string{
		"tables": {},
		"views":  {},
	}

	for _, table := range tableNames["tables"] {
		columns, err := getColumnNames(db, table, payload.Driver)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		result["tables"][table] = columns
	}

	for _, view := range tableNames["views"] {
		columns, err := getColumnNames(db, view, payload.Driver)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		result["views"][view] = columns
	}

	c.JSON(http.StatusOK, gin.H{"schema": result})
}

func openDB(payload DBPayload) (*sql.DB, error) {
	var dsn string
	if payload.Driver == "postgres" {
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=disable",
			payload.Host, payload.Username, payload.Password, payload.Database, payload.Port)
	} else if payload.Driver == "mysql" {
		dsn = fmt.Sprintf("%s:%s@tcp(%s:%d)/%s", payload.Username, payload.Password, payload.Host, payload.Port, payload.Database)
	} else {
		return nil, fmt.Errorf("unsupported driver")
	}

	return sql.Open(payload.Driver, dsn)
}

func getTableNames(db *sql.DB, driver, database string) (map[string][]string, error) {
	result := map[string][]string{
		"tables": {},
		"views":  {},
	}

	var rows *sql.Rows
	var err error

	if driver == "mysql" {
		query := `SELECT TABLE_NAME, TABLE_TYPE FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`
		rows, err = db.Query(query, database)
	} else if driver == "postgres" {
		query := `SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public'`
		rows, err = db.Query(query)
	} else {
		return nil, fmt.Errorf("unsupported driver: %s", driver)
	}

	if err != nil {
		fmt.Println("error", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var name, tableType string
		if err := rows.Scan(&name, &tableType); err != nil {
			return nil, err
		}

		if tableType == "BASE TABLE" {
			result["tables"] = append(result["tables"], name)
		} else if tableType == "VIEW" {
			result["views"] = append(result["views"], name)
		}
	}

	return result, nil
}

func getColumnNames(db *sql.DB, table, driver string) ([]string, error) {
	var query string
	var rows *sql.Rows
	var err error

	if driver == "postgres" {
		query = `SELECT column_name FROM information_schema.columns WHERE table_name=$1`
		rows, err = db.Query(query, table)
	} else if driver == "mysql" {
		query = `SHOW COLUMNS FROM ` + table
		rows, err = db.Query(query)
	} else {
		return nil, fmt.Errorf("unsupported driver")
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var columns []string
	for rows.Next() {
		if driver == "postgres" {
			var column string
			if err := rows.Scan(&column); err != nil {
				return nil, err
			}
			columns = append(columns, column)
		} else if driver == "mysql" {
			var field, colType, isNull, key, extra string
			var defVal sql.NullString
			if err := rows.Scan(&field, &colType, &isNull, &key, &defVal, &extra); err != nil {
				return nil, err
			}
			columns = append(columns, field)
		}
	}

	return columns, nil
}

func printLog(description string, data interface{}) {
	fmt.Printf("[LOG] %s: %+v\n", description, data)
}

func handleCustomQuery(c *gin.Context) {
	var payload DBPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate to allow only SELECT
	if len(payload.Query) < 6 ||
		!isSelectQuery(payload.Query) {
		c.JSON(http.StatusForbidden, gin.H{"error": "only SELECT queries are allowed"})
		return
	}

	db, err := openDB(payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer db.Close()

	rows, err := db.Query(payload.Query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	columns, err := rows.ColumnTypes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var results []map[string]interface{}

	for rows.Next() {
		values := make([]interface{}, len(columns))
		for i := range values {
			values[i] = new(interface{})
		}

		if err := rows.Scan(values...); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		row := make(map[string]interface{})
		for i, col := range columns {
			val := *(values[i].(*interface{}))
			if b, ok := val.([]byte); ok {
				row[col.Name()] = string(b)
			} else {
				row[col.Name()] = val
			}
		}

		results = append(results, row)
	}

	c.JSON(http.StatusOK, gin.H{"data": results})
}

func isSelectQuery(q string) bool {
	// Basic check; you can make this more robust
	return len(q) >= 6 && (q[0:6] == "SELECT" ||
		q[0:6] == "select")
}
