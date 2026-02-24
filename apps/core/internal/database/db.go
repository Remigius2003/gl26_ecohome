package database

import (
	"fmt"
	"gl26_ecohome/core/config"
	"gl26_ecohome/core/internal/models"
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

	err = db.AutoMigrate(
		&models.Conversation{}, &models.Message{},
		&models.Profile{}, &models.Friendship{},
		&models.QuizzResult{}, &models.DailyDefi{},
	)
	if err != nil {
		log.Fatalf("Database migration failed: %v", err)
	}

	log.Println("Database connected and migrated!")
}

func GetDatabase() *gorm.DB {
	if db == nil {
		initDatabase()
	}

	return db
}
