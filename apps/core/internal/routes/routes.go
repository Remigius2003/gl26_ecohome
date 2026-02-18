package routes

import (
	"gl26_ecohome/core/internal/handlers"
	"gl26_ecohome/core/internal/middleware"
	"gl26_ecohome/core/internal/services"
	"gl26_ecohome/core/internal/ws"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "OK"})
	})

	router.GET("/ws", ws.ServeWs)
	router.GET("/users/avatar/:id", handlers.GetAvatarHandler)

	if err := services.GetContentManager().LoadContent("internal/data"); err != nil {
		log.Printf("ERROR: Failed to load game content: %v", err)
	}

	ws.GetManager().On("chat_message", ws.HandleChatMessage)

	usersAuth := router.Group("/users")
	usersAuth.Use(middleware.JWTMiddleware)
	{
		usersAuth.PUT("/chat/:id/name", handlers.RenameGroupHandler)
		usersAuth.POST("/chat/message/:id", handlers.SendMessageHandler)
		usersAuth.POST("/chat/:id/participants", handlers.AddParticipantHandler)
		usersAuth.DELETE("/chat/:id/participants/:user_id", handlers.RemoveParticipantHandler)

		usersAuth.GET("/chat/conversations", handlers.GetConversationsHandler)
		usersAuth.POST("/chat/create", handlers.CreateConversationHandler)
		usersAuth.GET("/chat/history/:id", handlers.GetChatHistoryHandler)

		usersAuth.GET("/profile", handlers.GetProfileHandler)
		usersAuth.PUT("/profile", handlers.UpdateProfileHandler)
		usersAuth.POST("/avatar", handlers.UploadAvatarHandler)

		usersAuth.GET("/friends", handlers.ListFriendsHandler)
		usersAuth.GET("/friends/sent", handlers.ListSentRequestsHandler)
		usersAuth.GET("/friends/requests", handlers.ListRequestsHandler)
		usersAuth.POST("/friends/request", handlers.SendFriendRequestHandler)
		usersAuth.POST("/friends/cancel", handlers.CancelFriendRequestHandler)
		usersAuth.POST("/friends/respond", handlers.RespondFriendRequestHandler)
		usersAuth.GET("/friends/search", handlers.SearchUsersHandler)

		usersAuth.GET("/quizz/data", handlers.GetQuizzData)
		usersAuth.GET("/quizz/history", handlers.GetQuizzHistory)
		usersAuth.POST("/quizz/result", handlers.SubmitQuizzResult)

		usersAuth.GET("/defi/daily", handlers.GetDailyDefis)
		usersAuth.POST("/defi/complete", handlers.CompleteDefi)
	}
}
