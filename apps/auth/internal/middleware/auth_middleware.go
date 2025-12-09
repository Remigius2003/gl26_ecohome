package middleware

import (
	"gl26_ecohome/auths/config"
	"net/http"

	"github.com/gin-gonic/gin"
)

func APIKeyMiddleware(c *gin.Context) {
	expectedKey := config.GetConfig().APIKey
	apiKey := c.GetHeader("AUTH-API-KEY")

	if apiKey != expectedKey {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
		return
	}

	c.Next()
}
