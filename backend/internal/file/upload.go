package file

import (
	"encoding/csv"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
)

func HandleUpload(c *gin.Context) (interface{}, error) {
	file, _, err := c.Request.FormFile("file")
	if err != nil {
		return nil, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}
	if len(records) < 1 {
		return nil, fmt.Errorf("empty csv")
	}

	headers := records[0]
	var data []map[string]interface{}
	for _, row := range records[1:] {
		rowMap := make(map[string]interface{})
		for i, col := range row {
			rowMap[headers[i]] = strings.TrimSpace(col)
		}
		data = append(data, rowMap)
	}
	fmt.Println("Parsed CSV upload with", len(data), "records")
	return data, nil
}
