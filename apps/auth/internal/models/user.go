package models

import "time"

type User struct {
	Id           uint      `gorm:"primaryKey" json:"id"`
	Username     string    `gorm:"unique;not null" json:"username"`
	Email        string    `gorm:"unique;not null" json:"email,omitempty"`
	PasswordHash string    `gorm:"not null" json:"-"`
	IsActive     bool      `gorm:"default:true" json:"is_active,omitempty"`
	CreatedAt    time.Time `json:"created_at,omitempty"`
}

