package models

import "time"

type RefreshToken struct {
	Id     uint `gorm:"primaryKey" json:"token_id"`
	UserId uint `gorm:"not null;index" json:"user_id"`
	User   User `gorm:"foreignKey:UserId;constraint:OnDelete:CASCADE" json:"-"`

	Token     string    `gorm:"not null;uniqueIndex" json:"token"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	IsActive  bool      `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}

type TokenRequest struct {
	UserId       uint   `json:"user_id" binding:"required"`
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type JWTSecretKey struct {
	Id        uint   `json:"id"`
	Key       string `json:"key"`
	CreatedAt int64  `json:"created_at,omitempty"`
}

type JWTToken struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
}
