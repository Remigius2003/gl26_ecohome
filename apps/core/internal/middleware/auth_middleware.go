package middleware

import (
	"gl26_ecohome/core/config"
	"gl26_ecohome/core/internal/authclient"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func APIKeyMiddleware(c *gin.Context) {
	expectedKey := config.GetConfig().APIKey
	apiKey := c.GetHeader("CORE-API-KEY")

	if apiKey != expectedKey {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
		return
	}

	c.Next()
}

func JWTMiddleware(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")

	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
		return
	}

	const prefix = "Bearer "
	if !strings.HasPrefix(authHeader, prefix) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
		return
	}

	tokenString := strings.TrimPrefix(authHeader, prefix)
	userID, err := authclient.VerifyJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
		return
	}

	c.Set("user_id", userID)
	c.Next()
}