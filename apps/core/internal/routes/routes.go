package routes

import (
	"gl26_ecohome/core/internal/handlers"
	"gl26_ecohome/core/internal/middleware"
	"gl26_ecohome/core/internal/services"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "OK"})
	})
	router.GET("/users/avatar/:id", handlers.GetAvatarHandler)

	if err := services.GetContentManager().LoadContent("internal/data"); err != nil {
		log.Printf("ERROR: Failed to load game content: %v", err)
	}

	usersAuth := router.Group("/users")
	usersAuth.Use(middleware.JWTMiddleware)
	{
		usersAuth.GET("/profile", handlers.GetProfileHandler)
		usersAuth.PUT("/profile", handlers.UpdateProfileHandler)
		usersAuth.POST("/avatar", handlers.UploadAvatarHandler)

		usersAuth.GET("/friends", handlers.ListFriendsHandler)
		usersAuth.GET("/friends/requests", handlers.ListRequestsHandler)
		usersAuth.POST("/friends/request", handlers.SendFriendRequestHandler)
		usersAuth.POST("/friends/respond", handlers.RespondFriendRequestHandler)
		usersAuth.GET("/friends/search", handlers.SearchUsersHandler)

		usersAuth.GET("/quizz/data", handlers.GetQuizzData)
		usersAuth.GET("/quizz/history", handlers.GetQuizzHistory)
		usersAuth.POST("/quizz/result", handlers.SubmitQuizzResult)

		usersAuth.GET("/defi/daily", handlers.GetDailyDefis)
		usersAuth.POST("/defi/complete", handlers.CompleteDefi)
	}
}
