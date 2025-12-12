package routes

import (
	"gl26_ecohome/auths/internal/handlers"
	"gl26_ecohome/auths/internal/middleware"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "OK"})
	})

	users := router.Group("/users")
	{
		users.POST("/register", handlers.RegisterHandler)
		users.POST("/logout", handlers.LogoutHandler)
		users.POST("/login", handlers.LoginHandler)

		users.POST("/token", handlers.TokenHandler)
		users.POST("/jwt", handlers.JWTHandler)

		users.GET("/verify", handlers.VerifyHandler)
		users.GET("/info", handlers.InfosHandler)
	}

	jwt := router.Group("/jwt")
	jwt.Use(middleware.APIKeyMiddleware)
	{
		jwt.GET("/secretKeys", handlers.SecretKeysHandler)
		jwt.GET("/secretKey", handlers.SecretKeyHandler)
	}
}
