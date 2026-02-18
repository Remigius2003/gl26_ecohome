package models

import "time"

type Profile struct {
	UserId     uint   `gorm:"primaryKey" json:"user_id"`
	Bio        string `json:"bio"`
	AvatarData []byte `gorm:"type:bytea" json:"-"`
	AvatarType string `gorm:"size:50" json:"-"`

	IsGraphPublic bool      `gorm:"default:false" json:"is_graph_public"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type PublicProfile struct {
	UserId        uint   `json:"user_id"`
	Username      string `json:"username"`
	Bio           string `json:"bio"`
	AvatarURL     string `json:"avatar_url"`
	IsGraphPublic bool   `json:"is_graph_public"`
}
