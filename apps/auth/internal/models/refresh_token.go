package models

import "time"

type RefreshToken struct {
	Id        int64     `json:"token_id,omitempty"`
	UserId    string    `json:"user_id"`
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at,omitempty"`
	IsActive  bool      `json:"is_active,omitempty"`
	CreatedAt time.Time `json:"created_at,omitempty"`
}
