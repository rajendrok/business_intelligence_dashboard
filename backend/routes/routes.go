package routes

import (
	"main/api"

	"github.com/gin-gonic/gin"
)

func HandleRoute() {
	r := gin.Default()
	r.Use(api.CORSMiddleware())

	r.POST("/db-schema", api.HandleDBSchema)
	r.POST("/table-data", api.HandleFetchTableData)
	r.POST("/custom-query", api.HandleCustomQuery)
	r.POST("/upload", api.HandleFileUpload) // future file upload
	r.POST("/multi-join", api.JoinHandler)

	r.Run(":8080")
}
