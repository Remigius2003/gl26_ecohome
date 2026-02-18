package ws

import (
	"gl26_ecohome/core/internal/authclient"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ServeWs(c *gin.Context) {
	manager := GetManager()
	hub := manager.Hub

	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing token"})
		return
	}

	userID, err := authclient.VerifyJWT(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	client := &Client{
		Hub:    hub,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		UserID: userID,
	}

	client.Hub.register <- client
	go client.WritePump()
	go client.ReadPump()
}
