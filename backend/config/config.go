package config

import "context"

var (
	DRUID_IngestEndpoint   = "https://druid.dev.wikibedtimestories.com/druid/indexer/v1"
	DRUID_SQLQueryEndpoint = "https://druid.dev.wikibedtimestories.com/druid/v2/sql"

	CTX = context.Background()
)
