package config

import (
	"log"
	"os"
	"sync"

	"github.com/joho/godotenv"
)

type Config struct {
	APIPort        string
	APIKey         string
	DBHost         string
	DBPort         string
	DBName         string
	DBUser         string
	DBPwd          string
	AuthServiceURL string
	AuthServiceKey string
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
		APIPort:        getEnv("PORT", "5002"),
		APIKey:         getEnv("API_KEY", "secretKey"),
		DBHost:         getEnv("DB_HOST", "database"),
		DBPort:         getEnv("DB_PORT", "5432"),
		DBName:         getEnv("DB_NAME", "appdb"),
		DBUser:         getEnv("DB_USER", "postgres"),
		DBPwd:          getEnv("DB_PASSWORD", "password"),
		AuthServiceURL: getEnv("AUTH_SERVICE_URL", "http://auth:5000"),
		AuthServiceKey: getEnv("AUTH_SERVICE_KEY", "secretKey"),
	}
}

func GetConfig() *Config {
	mu.Lock()
	defer mu.Unlock()

	configInst = loadConfig()
	return configInst
}
