package config

import (
	"log"
	"os"
	"sync"

	"github.com/joho/godotenv"
)

type Config struct {
	APIPort string
	APIKey  string
	DBHost  string
	DBPort  string
	DBName  string
	DBUser  string
	DBPwd   string
}

var (
	configInst *Config
	mu         sync.Mutex
)

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func loadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println(".env wasn't found ! Using system env variables instead !")
	}

	return &Config{
		APIPort: getEnv("PORT", "5001"),
		APIKey:  getEnv("API_KEY", "secretKey"),
		DBHost:  getEnv("DB_HOST", "database"),
		DBPort:  getEnv("DB_PORT", "5432"),
		DBName:  getEnv("DB_NAME", "appdb"),
		DBUser:  getEnv("DB_USER", "postgres"),
		DBPwd:   getEnv("DB_PASSWORD", "password"),
	}
}

func GetConfig() *Config {
	mu.Lock()
	defer mu.Unlock()

	configInst = loadConfig()
	return configInst
}
