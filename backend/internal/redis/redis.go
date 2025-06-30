package redis

import (
	"encoding/json"
	"main/config"

	"github.com/go-redis/redis/v8"
)

func GetExcelFromRedis(fileID string) ([]map[string]interface{}, error) {
	rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
	val, err := rdb.Get(config.CTX, fileID).Result()
	if err != nil {
		return nil, err
	}
	var data []map[string]interface{}
	err = json.Unmarshal([]byte(val), &data)
	return data, err
}
