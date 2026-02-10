package models

import "time"

type User struct {
	Id        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"unique;not null" json:"username"`
	Email     string    `gorm:"unique;not null" json:"email,omitempty"`
	IsActive  bool      `gorm:"default:true" json:"is_active,omitempty"`
	CreatedAt time.Time `json:"created_at,omitempty"`
	Profile   Profile   `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`

	Quizzs              []QuizzResult `gorm:"foreignKey:UserID" json:"-"`
	Defis               []DailyDefi   `gorm:"foreignKey:UserID" json:"-"`
	FriendshipsSent     []Friendship  `gorm:"foreignKey:RequesterID" json:"-"`
	FriendshipsReceived []Friendship  `gorm:"foreignKey:AddresseeID" json:"-"`
}
