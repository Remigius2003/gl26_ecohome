package database

import (
	"database/sql"
	"fmt"
	"gl26_ecohome/auths/config"
	"log"

	_ "github.com/lib/pq"
)

var db *sql.DB

func initDatabase() {
	cfg := config.GetConfig()
	logStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPwd, cfg.DBName,
	)

	var err error
	db, err = sql.Open("postgres", logStr)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v !", err)
	}

	if err := db.Ping(); err != nil {
		log.Fatalf("Database not reachable: %v !", err)
	}
}

func GetDatabase() *sql.DB {
	if db == nil {
		initDatabase()
	}
	return db
}
