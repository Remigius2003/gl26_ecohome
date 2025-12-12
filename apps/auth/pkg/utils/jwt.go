package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateJWT(userId uint, expiration time.Time, secretKey string) (string, error) {
	if secretKey == "" {
		return "", errors.New("secret key cannot be empty")
	}

	// Create JWT claims
	claims := jwt.MapClaims{
		"userId": userId,
		"exp":    expiration.Unix(),
		"iat":    time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", err
	}

	return signedToken, nil
}