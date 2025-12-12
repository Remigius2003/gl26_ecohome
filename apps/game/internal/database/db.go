package database

import (
	"fmt"
	"gl26_ecohome/game/config"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func initDatabase() {
	cfg := config.GetConfig()

	dsn := fmt.Sprintf(
        "host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
        cfg.DBHost, cfg.DBUser, cfg.DBPwd, cfg.DBName, cfg.DBPort,
    )

	var err error
    db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatalf("Failed to connect to database: %v !", err)
    }
	
    log.Println("Database connected and migrated!")
}

func GetDatabase() *gorm.DB {
	if db == nil {
		initDatabase()
	}

	return db
}
