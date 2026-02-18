package handlers

import (
	"fmt"
	"gl26_ecohome/core/internal/database"
	"gl26_ecohome/core/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const MaxGroupParticipants = 50

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
			return db.Order("created_at DESC").Limit(1)
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
			results[i].LastMessage = conv.Messages[0].Content
			results[i].LastMessageAt = conv.Messages[0].CreatedAt
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

	totalParticipants := len(req.TargetIds) + 1 // +1 for creator
	if totalParticipants > MaxGroupParticipants {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Group size cannot exceed %d", MaxGroupParticipants),
		})
		return
	}

	// Transaction to ensure atomicity
	err := db.Transaction(func(tx *gorm.DB) error {
		// DM Logic
		if len(req.TargetIds) == 1 {
			targetId := req.TargetIds[0]

			// Check if DM exists using GROUP BY / HAVING count logic or simple join
			var existingID uint

			// PROD QUERY: Find conversation with exactly these 2 participants and type DM
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
				return nil // Stop transaction, but not error
			}

			conv := models.Conversation{
				Type: models.ConversationDM,
				Participants: []models.User{
					{Id: userId},
					{Id: targetId},
				},
			}
			if err := tx.Create(&conv).Error; err != nil {
				return err
			}
			c.JSON(http.StatusCreated, conv)
			return nil
		}

		// Group Logic
		participants := []models.User{{Id: userId}}
		for _, id := range req.TargetIds {
			participants = append(participants, models.User{Id: id})
		}

		conv := models.Conversation{
			Type:         models.ConversationGroup,
			Name:         req.Name,
			Participants: participants,
		}

		if err := tx.Create(&conv).Error; err != nil {
			return err
		}

		c.JSON(http.StatusCreated, conv)
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create conversation"})
	}
}
