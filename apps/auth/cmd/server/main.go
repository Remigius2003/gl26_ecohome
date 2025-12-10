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
	db := database.GetDatabase()
	defer db.Close()

	router := gin.Default()
	router.Use(cors.Default())
	routes.SetupRoutes(router)

	port := config.GetConfig().APIPort
	log.Printf("Auth Service running on port :%s\n", port)
	router.Run(fmt.Sprintf(":%s", port))
}
