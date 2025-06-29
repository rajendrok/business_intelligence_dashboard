package main

import (
	"main/routes"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
)

func main() {
	routes.HandleRoute()
}
