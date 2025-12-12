package models

import "time"

type JWTToken struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
}