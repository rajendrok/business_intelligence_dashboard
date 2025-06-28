package api

import (
	"main/internal/db"
	"main/internal/druid"
	"main/internal/file"
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
		if err == nil && len(druidData) > 0 {
			result[table] = druidData
			continue
		}

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
