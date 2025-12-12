package models

import "time"

type RefreshToken struct {
	Id        uint      `gorm:"primaryKey" json:"token_id"`
	UserId    uint      `gorm:"not null;index" json:"user_id"`
	User      User      `gorm:"foreignKey:UserId;constraint:OnDelete:CASCADE"`

	Token     string    `gorm:"not null" json:"token"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	IsActive  bool      `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}