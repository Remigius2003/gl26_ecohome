package models

import "time"

type User struct {
	Id           string    `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email,omitempty"`
	PasswordHash string    `json:"-"`
	IsActive     bool      `json:"is_active,omitempty"`
	CreatedAt    time.Time `json:"created_at,omitempty"`
}
