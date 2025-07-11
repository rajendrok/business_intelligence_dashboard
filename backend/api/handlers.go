package api

import (
	"database/sql"
	"fmt"
	"main/internal/db"
	"main/internal/druid"
	"main/internal/file"
	"main/internal/redis"
	"main/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func HandleFetchTableData(c *gin.Context) {
	var payload models.DBPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dbConn, err := db.OpenDB(payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer dbConn.Close()

	result := make(map[string][]map[string]interface{})
	for table, cols := range payload.Tables {
		// Try fetching from Druid first
		druidData, err := druid.QueryTable(table)
		fmt.Println("druidData", druidData)
		if err == nil && len(druidData) > 0 {
			result[table] = druidData
			continue
		} else {

			// Fallback to DB fetch
			dbData, err := db.FetchTableData(dbConn, table, payload.Limit, payload.Offset, payload.Driver, cols)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			result[table] = dbData

			// Upload to Druid in background
			go druid.IngestData(table, dbData)
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

func HandleDBSchema(c *gin.Context) {
	var payload models.DBPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dbConn, err := db.OpenDB(payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer dbConn.Close()
	schema, err := db.FetchSchema(dbConn, payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"schema": schema})
}

func HandleCustomQuery(c *gin.Context) {
	var payload models.DBPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !db.IsSelectQuery(payload.Query) {
		c.JSON(http.StatusForbidden, gin.H{"error": "only SELECT queries are allowed"})
		return
	}

	// Try from Druid first
	if druidData, err := druid.QueryRawSQL(payload.Query); err == nil && len(druidData) > 0 {
		c.JSON(http.StatusOK, gin.H{"data": druidData})
		return
	}

	dbConn, err := db.OpenDB(payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer dbConn.Close()

	result, err := db.RunCustomQuery(dbConn, payload.Query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Async ingest into Druid
	go druid.IngestData("custom_query", result)

	c.JSON(http.StatusOK, gin.H{"data": result})
}

func HandleFileUpload(c *gin.Context) {
	fileData, err := file.HandleUpload(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if fileData != nil {
		druid.IngestData("uploaded_file", fileData.([]map[string]interface{}))
	}
	c.JSON(http.StatusOK, gin.H{"message": "file uploaded and ingested"})
}
func JoinHandler(c *gin.Context) {
	var req models.JoinRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dataMap := make(map[string][]map[string]interface{})
	dbCache := make(map[string]*sql.DB)

	for _, src := range req.Sources {
		switch src.Type {
		case "database":
			key := fmt.Sprintf("%s:%d:%s:%s", src.Credentials.Host, src.Credentials.Port, src.Credentials.Username, src.Credentials.Database)
			if _, exists := dbCache[key]; !exists {
				database, err := db.OpenDB(src.Credentials)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				dbCache[key] = database
			}
			database := dbCache[key]
			rows, err := database.Query(fmt.Sprintf("SELECT * FROM %s", src.Table))
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			data, err := db.ScanRows(rows)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			dataMap[src.SourceID] = data
		case "excel":
			data, err := redis.GetExcelFromRedis(src.FileID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			dataMap[src.SourceID] = data
		}
	}

	if _, ok := dataMap[req.Joins[0].LeftSource]; !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing initial join source: " + req.Joins[0].LeftSource})
		return
	}

	result := []map[string]interface{}{}

	for i, join := range req.Joins {
		leftData, leftOk := dataMap[join.LeftSource]
		if i > 0 && join.LeftSource == req.Joins[i-1].LeftSource {
			leftData = result
		} else if !leftOk {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing left join source: " + join.LeftSource})
			return
		}

		rightData, rightOk := dataMap[join.RightSource]
		if !rightOk {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing right join source: " + join.RightSource})
			return
		}

		joined, err := db.DispatchJoin(join.Type, leftData, rightData, join.LeftColumn, join.RightColumn, join.LeftSource, join.RightSource)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		result = joined
	}

	c.JSON(http.StatusOK, gin.H{"data": result, "count": len(result)})
}
