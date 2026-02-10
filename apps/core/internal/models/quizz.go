package models

import (
	"time"

	"gorm.io/gorm"
)

type QuizzBloc map[string]Question

type Question struct {
	ID           string    `json:"id"`
	Evolution    string    `json:"evolution"`
	Text         string    `json:"text"`
	Responses    []Answer  `json:"responses"`
	CarbonImpact []float64 `json:"carbonImpact,omitempty"`
}

type Answer struct {
	ID           string    `json:"id"`
	Text         string    `json:"text"`
	Children     []string  `json:"children,omitempty"`
	CarbonImpact []float64 `json:"carbonImpact,omitempty"`
}

type QuizzResult struct {
	gorm.Model
	UserID   uint   `gorm:"primaryKey"`
	Category string `gorm:"type:varchar(50)"`
	Emission float64
	Date     time.Time
}
