package main

import (
	"fmt"
	"gl26_ecohome/auths/config"
	"gl26_ecohome/auths/internal/database"
	"gl26_ecohome/auths/internal/handlers"
	"gl26_ecohome/auths/internal/routes"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	go handlers.StartSecretKeysRotation()

	sqlDB, err := database.GetDatabase().DB()
    if err != nil {
        log.Fatalf("Failed to get sql.DB from gorm: %v", err)
    }
    defer sqlDB.Close()

	router := gin.New()
	router.Use(gin.Logger()) 
	router.Use(gin.Recovery())
	router.SetTrustedProxies([]string{"127.0.0.1"})
	router.Use(cors.Default())
	
    routes.SetupRoutes(router)

	port := config.GetConfig().APIPort
    log.Printf("Auth Service running on port :%s\n", port)

    router.Run(fmt.Sprintf(":%s", port))
}
