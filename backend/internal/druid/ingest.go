package druid

import (
	"bytes"
	"encoding/json"
	"fmt"
	"main/config"
	"net/http"
	"time"
)

var druidEndpoint = config.DRUID_URL + "/sql/task" // Change to your actual Druid endpoint

func IngestData(table string, data []map[string]interface{}) {
	payload := map[string]interface{}{
		"type": "index",
		"spec": map[string]interface{}{
			"type": "index",
			"spec": map[string]interface{}{
				"dataSchema": map[string]interface{}{
					"dataSource": table,
					"parser": map[string]interface{}{
						"type": "string",
						"parseSpec": map[string]interface{}{
							"format":         "json",
							"timestampSpec":  map[string]string{"column": "__time", "format": "auto"},
							"dimensionsSpec": map[string]interface{}{},
						},
					},
					"metricsSpec": []interface{}{},
					"granularitySpec": map[string]string{
						"type":               "uniform",
						"segmentGranularity": "day",
						"queryGranularity":   "none",
					},
				},
				"ioConfig": map[string]interface{}{
					"type": "index",
					"inputSource": map[string]interface{}{
						"type": "inline",
						"data": marshalRows(data),
					},
					"inputFormat": map[string]string{"type": "json"},
				},
				"tuningConfig": map[string]string{"type": "index"},
			},
		},
	}

	b, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", druidEndpoint, bytes.NewBuffer(b))
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
	fmt.Println("Druid ingest response:", resp.Status)
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
	return QueryRawSQL(query)
}

func QueryRawSQL(query string) ([]map[string]interface{}, error) {
	body := map[string]string{"query": query}
	b, _ := json.Marshal(body)
	req, err := http.NewRequest("POST", config.DRUID_URL+"/sql", bytes.NewBuffer(b))
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
