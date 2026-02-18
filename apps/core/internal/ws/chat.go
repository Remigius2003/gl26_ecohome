package ws

import (
	"encoding/json"
	"gl26_ecohome/core/internal/database"
	"gl26_ecohome/core/internal/models"
	"log"
	"time"
)

type ChatMessagePayload struct {
	ConversationId uint   `json:"conversation_id"`
	Content        string `json:"content"`
}

func HandleChatMessage(ctx *Context) error {
	var payload ChatMessagePayload
	if err := json.Unmarshal(ctx.Payload, &payload); err != nil {
		return err
	}

	db := database.GetDatabase()
	senderId := ctx.Client.UserId

	msg := models.Message{
		ConversationId: payload.ConversationId,
		SenderId:       senderId,
		Content:        payload.Content,
		CreatedAt:      time.Now(),
	}

	if err := db.Create(&msg).Error; err != nil {
		log.Printf("Failed to save message: %v", err)
		return err
	}

	var conversation models.Conversation
	if err := db.Preload("Participants").First(&conversation, payload.ConversationId).Error; err != nil {
		return err
	}

	var sender models.User
	db.First(&sender, senderId)
	msg.Sender = sender

	response := struct {
		Type    string         `json:"type"`
		Payload models.Message `json:"payload"`
	}{
		Type:    "new_message",
		Payload: msg,
	}

	for _, p := range conversation.Participants {
		ctx.Client.Hub.SendToUser(p.Id, response)
	}

	return nil
}
