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

	result, err := db.FetchTables(dbConn, payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
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
	c.JSON(http.StatusOK, gin.H{"data": result})
}

func HandleFileUpload(c *gin.Context) {
	fileData, err := file.HandleUpload(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	druid.IngestData(fileData)
	c.JSON(http.StatusOK, gin.H{"message": "file uploaded and ingested"})
}
