package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"gl26_ecohome/core/internal/database"
	"gl26_ecohome/core/internal/models"
	"gl26_ecohome/core/internal/ws"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const MaxGroupParticipants = 50

func parseUintParam(c *gin.Context, key string) (uint, error) {
	v, err := strconv.ParseUint(c.Param(key), 10, 64)
	return uint(v), err
}

func isParticipant(db *gorm.DB, convId, userId uint) bool {
	var count int64
	db.Table("conversation_participants").
		Where("conversation_id = ? AND user_id = ?", convId, userId).
		Count(&count)
	return count > 0
}

func broadcastToConversation(convId uint, payload interface{}) {
	db := database.GetDatabase()
	var conv models.Conversation
	if err := db.Preload("Participants").First(&conv, convId).Error; err != nil {
		return
	}
	hub := ws.GetManager().Hub
	for _, p := range conv.Participants {
		hub.SendToUser(p.Id, payload)
	}
}

func saveSystemMessage(convId uint, text string) {
	db := database.GetDatabase()
	msg := models.Message{
		ConversationId: convId,
		SenderId:       0,
		Content:        text,
	}
	if err := db.Create(&msg).Error; err != nil {
		return
	}
	broadcastToConversation(convId, gin.H{
		"type":    "new_message",
		"payload": msg,
	})
}

func participantName(userId uint) string {
	db := database.GetDatabase()
	var user models.User
	if err := db.First(&user, userId).Error; err != nil {
		return fmt.Sprintf("User %d", userId)
	}
	return user.Username
}

func GetConversationsHandler(c *gin.Context) {
	userId := c.MustGet("user_id").(uint)
	db := database.GetDatabase()

	var conversations []models.Conversation
	err := db.Table("conversations").
		Select("conversations.*, MAX(messages.created_at) as last_activity").
		Joins("JOIN conversation_participants cp ON cp.conversation_id = conversations.id").
		Joins("LEFT JOIN messages ON messages.conversation_id = conversations.id").
		Where("cp.user_id = ?", userId).
		Group("conversations.id").
		Order("last_activity DESC NULLS LAST").
		Preload("Participants").
		Preload("Messages", func(db *gorm.DB) *gorm.DB {
			return db.
				Where("messages.id IN (SELECT MAX(id) FROM messages GROUP BY conversation_id)").
				Preload("Sender")
		}).
		Find(&conversations).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch chats"})
		return
	}

	results := make([]models.ConversationDTO, len(conversations))
	for i, conv := range conversations {
		results[i] = models.ConversationDTO{
			ID:           conv.Id,
			Type:         conv.Type,
			Name:         conv.Name,
			Participants: conv.Participants,
		}
		if len(conv.Messages) > 0 {
			msg := conv.Messages[0]
			if msg.SenderId == 0 {
				results[i].LastMessage = "💬 " + msg.Content
			} else {
				results[i].LastMessage = msg.Content
			}
			results[i].LastMessageAt = msg.CreatedAt
		} else {
			results[i].LastMessage = "No messages yet"
			results[i].LastMessageAt = conv.CreatedAt
		}
	}

	c.JSON(http.StatusOK, results)
}

func CreateConversationHandler(c *gin.Context) {
	userId := c.MustGet("user_id").(uint)
	db := database.GetDatabase()

	var req models.CreateChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if len(req.TargetIds)+1 > MaxGroupParticipants {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Group size cannot exceed %d", MaxGroupParticipants),
		})
		return
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		if len(req.TargetIds) == 1 {
			return createOrFetchDM(c, tx, userId, req.TargetIds[0])
		}
		return createGroup(c, tx, userId, req)
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create conversation"})
	}
}

func createOrFetchDM(c *gin.Context, tx *gorm.DB, userId, targetId uint) error {
	var existingID uint
	query := `
		SELECT c.id FROM conversations c
		JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = ?
		JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = ?
		WHERE c.type = 'dm'
		LIMIT 1
	`
	if err := tx.Raw(query, userId, targetId).Scan(&existingID).Error; err == nil && existingID != 0 {
		var existing models.Conversation
		tx.Preload("Participants").First(&existing, existingID)
		c.JSON(http.StatusOK, existing)
		return nil
	}

	conv := models.Conversation{Type: models.ConversationDM}
	if err := tx.Create(&conv).Error; err != nil {
		return err
	}

	participants := []models.ConversationParticipant{
		{ConversationID: conv.Id, UserID: userId},
		{ConversationID: conv.Id, UserID: targetId},
	}
	if err := tx.Create(&participants).Error; err != nil {
		return err
	}

	tx.Preload("Participants").First(&conv, conv.Id)
	c.JSON(http.StatusCreated, conv)
	return nil
}

func createGroup(c *gin.Context, tx *gorm.DB, userId uint, req models.CreateChatRequest) error {
	conv := models.Conversation{Type: models.ConversationGroup, Name: req.Name}
	if err := tx.Create(&conv).Error; err != nil {
		return err
	}

	participants := []models.ConversationParticipant{{ConversationID: conv.Id, UserID: userId}}
	for _, id := range req.TargetIds {
		participants = append(participants, models.ConversationParticipant{
			ConversationID: conv.Id,
			UserID:         id,
		})
	}
	if err := tx.Create(&participants).Error; err != nil {
		return err
	}

	systemMsgText := fmt.Sprintf("%s created the group \"%s\"", participantName(userId), req.Name)
	sysMsg := models.Message{
		ConversationId: conv.Id,
		SenderId:       0,
		Content:        systemMsgText,
	}
	if err := tx.Create(&sysMsg).Error; err != nil {
		fmt.Printf("Failed to create group system message: %v\n", err)
	}

	tx.Preload("Participants").First(&conv, conv.Id)
	c.JSON(http.StatusCreated, conv)
	return nil
}

func SendMessageHandler(c *gin.Context) {
	userId := c.MustGet("user_id").(uint)
	db := database.GetDatabase()

	convId, err := parseUintParam(c, "id")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	var input struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if !isParticipant(db, convId, userId) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not a participant"})
		return
	}

	msg := models.Message{
		ConversationId: convId,
		SenderId:       userId,
		Content:        input.Content,
	}
	if err := db.Create(&msg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send message"})
		return
	}

	db.Preload("Sender").First(&msg, msg.Id)
	broadcastToConversation(convId, gin.H{
		"type":    "new_message",
		"payload": msg,
	})

	c.JSON(http.StatusCreated, msg)
}

func GetChatHistoryHandler(c *gin.Context) {
	userId := c.MustGet("user_id").(uint)
	db := database.GetDatabase()

	convId, err := parseUintParam(c, "id")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	if !isParticipant(db, convId, userId) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not a participant"})
		return
	}

	var messages []models.Message
	db.Where("conversation_id = ?", convId).
		Order("created_at DESC").
		Limit(50).
		Preload("Sender").
		Find(&messages)

	c.JSON(http.StatusOK, messages)
}

func AddParticipantHandler(c *gin.Context) {
	userId := c.MustGet("user_id").(uint)
	db := database.GetDatabase()

	convId, err := parseUintParam(c, "id")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	var input struct {
		TargetID uint `json:"target_id"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var conv models.Conversation
	if err := db.First(&conv, convId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chat not found"})
		return
	}
	if conv.Type == models.ConversationDM {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot add users to a DM"})
		return
	}
	if !isParticipant(db, convId, userId) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not a participant"})
		return
	}

	if err := db.Create(&models.ConversationParticipant{
		ConversationID: convId,
		UserID:         input.TargetID,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add participant"})
		return
	}

	saveSystemMessage(convId, fmt.Sprintf(
		"%s added %s to the group",
		participantName(userId),
		participantName(input.TargetID),
	))

	ws.GetManager().Hub.SendToUser(input.TargetID, gin.H{
		"type":    "new_conversation",
		"payload": gin.H{"conversation_id": convId},
	})

	c.JSON(http.StatusOK, gin.H{"message": "Participant added"})
}

func RemoveParticipantHandler(c *gin.Context) {
	userId := c.MustGet("user_id").(uint)
	db := database.GetDatabase()

	convId, err1 := parseUintParam(c, "id")
	targetId, err2 := parseUintParam(c, "user_id")
	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if !isParticipant(db, convId, userId) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not a participant"})
		return
	}

	if !isParticipant(db, convId, targetId) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Target user not in conversation"})
		return
	}

	result := db.Exec(
		"DELETE FROM conversation_participants WHERE conversation_id = ? AND user_id = ?",
		convId, targetId,
	)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove participant"})
		return
	}

	var count int64
	db.Table("conversation_participants").
		Where("conversation_id = ?", convId).
		Count(&count)

	if count == 0 {
		db.Delete(&models.Message{}, "conversation_id = ?", convId)
		db.Delete(&models.Conversation{}, convId)

		c.JSON(http.StatusOK, gin.H{"message": "Conversation deleted"})
		return
	}

	if userId == targetId {
		saveSystemMessage(
			convId,
			fmt.Sprintf("%s left the group", participantName(userId)),
		)
	} else {
		saveSystemMessage(
			convId,
			fmt.Sprintf(
				"%s removed %s from the group",
				participantName(userId),
				participantName(targetId),
			),
		)
	}

	ws.GetManager().Hub.SendToUser(targetId, gin.H{
		"type":    "conversation_removed",
		"payload": gin.H{"conversation_id": convId},
	})

	c.JSON(http.StatusOK, gin.H{"message": "Participant removed"})
}

func RenameGroupHandler(c *gin.Context) {
	userId := c.MustGet("user_id").(uint)
	db := database.GetDatabase()

	convId, err := parseUintParam(c, "id")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	var input struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil || input.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var conv models.Conversation
	if err := db.First(&conv, convId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Conversation not found"})
		return
	}

	if conv.Type != models.ConversationGroup {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot rename a DM"})
		return
	}

	if !isParticipant(db, convId, userId) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not a participant"})
		return
	}

	oldName := conv.Name
	if err := db.Model(&conv).Update("name", input.Name).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to rename group"})
		return
	}

	saveSystemMessage(convId, fmt.Sprintf(
		"%s renamed the group from \"%s\" to \"%s\"",
		participantName(userId),
		oldName,
		input.Name,
	))

	broadcastToConversation(convId, gin.H{
		"type": "group_renamed",
		"payload": gin.H{
			"conversation_id": convId,
			"name":            input.Name,
		},
	})

	c.JSON(http.StatusOK, gin.H{"message": "Group renamed"})
}
