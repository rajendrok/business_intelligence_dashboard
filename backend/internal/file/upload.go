package file

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

func HandleUpload(c *gin.Context) (interface{}, error) {
	file, _, err := c.Request.FormFile("file")
	if err != nil {
		return nil, err
	}
	defer file.Close()

	// Process file (CSV, Excel parsing etc.)
	fmt.Println("File uploaded")
	return nil, nil // Replace with actual parsed data
}
