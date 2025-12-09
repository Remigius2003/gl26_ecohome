package models

type JWTSecretKey struct {
	Id        int    `json:"id"`
	Key       string `json:"key"`
	CreatedAt int64  `json:"created_at,omitempty"`
}
