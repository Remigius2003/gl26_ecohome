package main

import (
	"fmt"
	"gl26_ecohome/game/config"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.Use(cors.Default())
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "OK"})
	})

	port := config.GetConfig().APIPort
	log.Printf("Game Service running on port :%s\n", port)
	router.Run(fmt.Sprintf(":%s", port))
}
