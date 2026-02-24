package models

import "github.com/golang-jwt/jwt/v5"

type JWTSecretKey struct {
	Id        uint   `json:"id"`
	Key       string `json:"key"`
	CreatedAt int64  `json:"created_at,omitempty"`
}

type SecretKeysResponse struct {
	Current JWTSecretKey `json:"current"`
	Next    JWTSecretKey `json:"next"`
	Old     JWTSecretKey `json:"old"`
}

type CustomClaims struct {
	UserId uint `json:"user_id"`
	jwt.RegisteredClaims
}
