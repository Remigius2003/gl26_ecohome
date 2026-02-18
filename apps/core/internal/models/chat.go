package models

import "time"

type ConversationType string

const (
	ConversationDM    ConversationType = "dm"
	ConversationGroup ConversationType = "group"
)

type Conversation struct {
	Id        uint             `gorm:"primaryKey" json:"id"`
	Type      ConversationType `json:"type"`
	Name      string           `json:"name"`
	CreatedAt time.Time        `json:"created_at"`

	Participants []User    `gorm:"many2many:conversation_participants;" json:"participants"`
	Messages     []Message `json:"messages,omitempty"`
}

type ConversationParticipant struct {
	ConversationID uint `gorm:"primaryKey"`
	UserID         uint `gorm:"primaryKey"`
}

type Message struct {
	Id             uint      `gorm:"primaryKey" json:"id"`
	ConversationId uint      `json:"conversation_id"`
	SenderId       uint      `json:"sender_id"`
	Content        string    `json:"content"`
	CreatedAt      time.Time `json:"created_at"`

	Sender User `gorm:"foreignKey:SenderId;constraint:-" json:"sender,omitempty"`
}

type CreateChatRequest struct {
	TargetIds []uint `json:"target_ids"`
	Name      string `json:"name"`
}

type ConversationDTO struct {
	ID            uint             `json:"id"`
	Type          ConversationType `json:"type"`
	Name          string           `json:"name"`
	Participants  []User           `json:"participants"`
	LastMessage   string           `json:"last_message"`
	LastMessageAt time.Time        `json:"last_message_at"`
}
