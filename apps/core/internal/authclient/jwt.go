package authclient

import (
	"errors"
	"fmt"
	"gl26_ecohome/core/internal/models"
	"strconv"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrMissingToken     = errors.New("missing token")
	ErrInvalidToken     = errors.New("invalid token")
	ErrUnknownKID       = errors.New("unknown kid")
	ErrMissingSecretKey = errors.New("no secret keys available")
)

func VerifyJWT(tokenString string) (uint, error) {
	if tokenString == "" {
		return 0, ErrMissingToken
	}

	keys := GetSecretKeys()
	token, err := parseToken(tokenString, keys)

	if errors.Is(err, ErrUnknownKID) || errors.Is(err, ErrMissingSecretKey) {
		if fetchErr := FetchSecretKeys(); fetchErr == nil {
			keys = GetSecretKeys()
			token, err = parseToken(tokenString, keys)
		}
	}

	if err != nil {
		return 0, err
	}

	if !token.Valid {
		return 0, ErrInvalidToken
	}

	claims, ok := token.Claims.(*models.CustomClaims)
	if !ok {
		return 0, ErrInvalidToken
	}

	return claims.UserID, nil
}

func parseToken(tokenString string, keys *models.SecretKeysResponse) (*jwt.Token, error) {
	if keys == nil {
		return nil, ErrMissingSecretKey
	}

	return jwt.ParseWithClaims(
		tokenString,
		&models.CustomClaims{},
		func(token *jwt.Token) (any, error) {

			if token.Method.Alg() != jwt.SigningMethodHS256.Alg() {
				return nil, fmt.Errorf("unexpected signing method: %s", token.Method.Alg())
			}

			kid, err := extractKID(token.Header["kid"])
			if err != nil {
				return nil, err
			}

			switch kid {
			case keys.Current.Id:
				return []byte(keys.Current.Key), nil
			case keys.Old.Id:
				return []byte(keys.Old.Key), nil
			case keys.Next.Id:
				return []byte(keys.Next.Key), nil
			default:
				return nil, ErrUnknownKID
			}
		},
	)
}

func extractKID(raw any) (uint, error) {
	if raw == nil {
		return 0, errors.New("missing kid header")
	}

	switch v := raw.(type) {
	case float64:
		return uint(v), nil
	case string:
		id, err := strconv.Atoi(v)
		if err != nil {
			return 0, errors.New("invalid kid format")
		}
		return uint(id), nil
	default:
		return 0, errors.New("invalid kid type")
	}
}
