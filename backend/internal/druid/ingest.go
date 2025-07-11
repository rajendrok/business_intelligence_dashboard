package druid

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"main/config"
	"net/http"
	"time"
)

func IngestData(table string, data []map[string]interface{}) {
	fmt.Println("Starting Ingest data")

	// Ensure __time column exists
	for _, row := range data {
		if _, ok := row["__time"]; !ok {
			row["__time"] = time.Now().UTC().Format(time.RFC3339)
		}
	}

	payload := map[string]interface{}{
		"type": "index",
		"spec": map[string]interface{}{
			"dataSchema": map[string]interface{}{
				"dataSource": table,
				"timestampSpec": map[string]interface{}{
					"column": "__time",
					"format": "iso",
				},
				"dimensionsSpec": map[string]interface{}{
					"useSchemaDiscovery": true,
				},
				"granularitySpec": map[string]interface{}{
					"type":               "uniform",
					"segmentGranularity": "day",
					"queryGranularity":   "none",
				},
				"metricsSpec": []interface{}{},
			},
			"ioConfig": map[string]interface{}{
				"type": "index",
				"inputSource": map[string]interface{}{
					"type": "inline",
					"data": marshalRows(data), // This is your \n-separated NDJSON
				},
				"inputFormat": map[string]interface{}{
					"type":                   "json",
					"assumeNewlineDelimited": true,
					// "useJsonNodeReader":      true,
					"keepNullColumns": false,
				},
			},
			"tuningConfig": map[string]interface{}{
				"type": "index",
			},
		},
	}

	b, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", config.DRUID_IngestEndpoint+"/task", bytes.NewBuffer(b))
	if err != nil {
		fmt.Println("druid ingest request error:", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("druid ingest send error:", err)
		return
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	fmt.Println("Druid ingest response body:", string(bodyBytes))
}

func marshalRows(rows []map[string]interface{}) string {
	var buf bytes.Buffer
	for _, row := range rows {
		j, _ := json.Marshal(row)
		buf.Write(j)
		buf.WriteByte('\n')
	}
	return buf.String()
}

func QueryTable(table string) ([]map[string]interface{}, error) {
	query := fmt.Sprintf("SELECT * FROM %s LIMIT 1000", table)
	fmt.Println(query)
	// query := `SELECT DISTINCT datasource FROM sys.segments WHERE is_published = 1 AND is_available = 1`
	// fmt.Println("Druid SHOW TABLES query:", query)
	return QueryRawSQL(query)
}

func QueryRawSQL(query string) ([]map[string]interface{}, error) {
	body := map[string]string{"query": query}
	b, _ := json.Marshal(body)
	req, err := http.NewRequest("POST", config.DRUID_SQLQueryEndpoint, bytes.NewBuffer(b))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var results []map[string]interface{}
	decoder := json.NewDecoder(resp.Body)
	err = decoder.Decode(&results)
	if err != nil {
		return nil, err
	}
	return results, nil
}
