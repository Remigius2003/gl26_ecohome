package models

import (
	"time"

	"gorm.io/gorm"
)

type DefiDefinition struct {
	ID            string        `json:"id"`
	Defi          string        `json:"defi"`
	Category      string        `json:"category"`
	LeafReward    int           `json:"leafReward"`
	PercentReward int           `json:"percentReward"`
	OverQuestions *DefiQuestion `json:"overQuestions,omitempty"`
}

type DefiQuestion struct {
	ID        string       `json:"id"`
	Text      string       `json:"text"`
	Responses []DefiAnswer `json:"responses"`
}

type DefiAnswer struct {
	ID            string `json:"id"`
	Text          string `json:"text"`
	LeafReward    int    `json:"leafReward"`
	PercentReward int    `json:"percentReward"`
}

type DailyDefi struct {
	gorm.Model
	UserID       uint      `gorm:"primaryKey"`
	DefiID       string    `gorm:"type:varchar(50)"`
	DateAssigned time.Time `gorm:"type:date;index:idx_user_date"`
	Status       string    `gorm:"type:varchar(20);default:'PENDING'"`
	RewardEarned int       `gorm:"default:0"`
}
