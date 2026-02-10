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

	// Public
	users := router.Group("/auths")
	{
		users.GET("/verify", handlers.VerifyHandler)
		users.POST("/register", handlers.RegisterHandler)
		users.POST("/login", handlers.LoginHandler)
		users.POST("/token", handlers.TokenHandler)
		users.POST("/jwt", handlers.JWTHandler)
	}

	// Protected (JWT)
	usersAuth := router.Group("/auths")
	usersAuth.Use(middleware.JWTMiddleware)
	{
		usersAuth.POST("/logout", handlers.LogoutHandler)
		usersAuth.DELETE("/", handlers.DeleteAccountHandler)
		usersAuth.PUT("/password", handlers.ChangePasswordHandler)
		usersAuth.PUT("/username", handlers.ChangeUsernameHandler)
	}

	// Internal
	jwt := router.Group("/jwt")
	jwt.Use(middleware.APIKeyMiddleware)
	{
		jwt.GET("/secretKeys", handlers.SecretKeysHandler)
		jwt.GET("/secretKey", handlers.SecretKeyHandler)
	}
}
