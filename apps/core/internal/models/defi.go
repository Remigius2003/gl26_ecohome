package models

import (
	"time"

	"gorm.io/gorm"
)

type DefiDefinition struct {
	Id            string        `json:"id"`
	Defi          string        `json:"defi"`
	Category      string        `json:"category"`
	LeafReward    int           `json:"leafReward"`
	PercentReward int           `json:"percentReward"`
	OverQuestions *DefiQuestion `json:"overQuestions,omitempty"`
}

type DefiQuestion struct {
	Id        string       `json:"id"`
	Text      string       `json:"text"`
	Responses []DefiAnswer `json:"responses"`
}

type DefiAnswer struct {
	Id            string `json:"id"`
	Text          string `json:"text"`
	LeafReward    int    `json:"leafReward"`
	PercentReward int    `json:"percentReward"`
}

type DailyDefi struct {
	gorm.Model
	UserId       uint      `gorm:"primaryKey"`
	DefiId       string    `gorm:"type:varchar(50)"`
	DateAssigned time.Time `gorm:"type:date;index:idx_user_date"`
	Status       string    `gorm:"type:varchar(20);default:'PENDING'"`
	RewardEarned int       `gorm:"default:0"`
}
