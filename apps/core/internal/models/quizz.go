package models

import (
	"time"

	"gorm.io/gorm"
)

type QuizzBloc map[string]Question

type Question struct {
	Id           string    `json:"id"`
	Evolution    string    `json:"evolution"`
	Text         string    `json:"text"`
	Responses    []Answer  `json:"responses"`
	CarbonImpact []float64 `json:"carbonImpact,omitempty"`
}

type Answer struct {
	Id           string    `json:"id"`
	Text         string    `json:"text"`
	Children     []string  `json:"children,omitempty"`
	CarbonImpact []float64 `json:"carbonImpact,omitempty"`
}

type QuizzResult struct {
	gorm.Model
	UserId   uint   `gorm:"primaryKey"`
	Category string `gorm:"type:varchar(50)"`
	Emission float64
	Date     time.Time
}
