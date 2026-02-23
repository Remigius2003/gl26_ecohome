package models

import (
	"time"
)

type FriendshipStatus string

const (
	StatusPending  FriendshipStatus = "PENDING"
	StatusAccepted FriendshipStatus = "ACCEPTED"
)

type Friendship struct {
	RequesterID uint             `gorm:"primaryKey" json:"requester_id"`
	AddresseeID uint             `gorm:"primaryKey" json:"addressee_id"`
	Status      FriendshipStatus `json:"status"`
	CreatedAt   time.Time        `json:"created_at"`

	// Foreign Keys
	Requester User `gorm:"foreignKey:RequesterID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	Addressee User `gorm:"foreignKey:AddresseeID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
}

type FriendRequestAction struct {
	TargetID uint   `json:"target_id" binding:"required"`
	Action   string `json:"action" binding:"required,oneof=accept reject"`
}

type SearchResult struct {
	UserID    uint   `json:"user_id"`
	Username  string `json:"username"`
	AvatarURL string `json:"avatar_url"`
	Status    string `json:"status"` // "NONE", "FRIEND", "PENDING_SENT", "PENDING_RECEIVED"
}
