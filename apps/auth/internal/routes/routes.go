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
	users.Use(middleware.APIKeyMiddleware)
	{
		users.POST("/register", handlers.RegisterHandler)
		users.POST("/login", handlers.LoginHandler)
		users.GET("/infos", handlers.InfosHandler)
		users.POST("/logout", handlers.LogoutHandler)
		users.GET("/token", handlers.TokenHandler)
		users.GET("/verify", handlers.VerifyHandler)

		users.GET("/leaderboard/day/:id", handlers.LeaderboardDayHandler)
		users.GET("/leaderboard/week/:id", handlers.LeaderboardWeekHandler)
		users.GET("/leaderboard/month/:id", handlers.LeaderboardMonthHandler)
		users.GET("/leaderboard/all/:id", handlers.LeaderboardAllHandler)
		users.GET("history/:id", handlers.MatchHistoryHandler)
		users.GET("stats/:id", handlers.StatsHandler)
	}

	jwt := router.Group("/jwt")
	jwt.Use(middleware.APIKeyMiddleware)
	{
		jwt.GET("/secretKeys", handlers.SecretKeysHandler)
		jwt.GET("/secretKey", handlers.SecretKeyHandler)
	}
}
