package handlers

import (
	"errors"
	"fmt"
	"gl26_ecohome/auths/internal/database"
	"gl26_ecohome/auths/internal/models"
	"gl26_ecohome/auths/pkg/utils"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const TOKEN_DURATION = 7 * 24 * time.Hour
type tokenReq struct {
	UserId       uint `json:"user_id"`
	Token        string `json:"refresh_token"`
}

func verifyToken(req *tokenReq) (*models.RefreshToken, error) {
    db := database.GetDatabase()

    var token models.RefreshToken
    err := db.
        Where("token = ? AND user_id = ? AND is_active = TRUE AND expires_at > ?", 
              req.Token, req.UserId, time.Now()).
        First(&token).
        Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &token, nil
}

func generateToken(userId uint) (*models.RefreshToken, error) {
    db := database.GetDatabase()

    db.Model(&models.RefreshToken{}).
        Where("user_id = ?", userId).
        Update("is_active", false)

	const maxRetries = 3
	for attempt := 0; attempt < maxRetries; attempt++ {
		tokenString, err := utils.GenerateRandomKey(128)
    	if err != nil {
			return nil, err
		}

		token := models.RefreshToken{
        	UserId:    userId,
        	Token:     tokenString,
        	ExpiresAt: time.Now().Add(TOKEN_DURATION),
        	IsActive:  true,
    	}

		if err := db.Create(&token).Error; err != nil {
			if errors.Is(err, gorm.ErrDuplicatedKey) ||
				strings.Contains(err.Error(), "duplicate") || 
				strings.Contains(err.Error(), "UNIQUE") {
				continue
			}

			return nil, fmt.Errorf("failed to save token: %w", err)
		}

		return &token, nil
	}

    return nil, fmt.Errorf("failed to generate unique token after %d attempts", maxRetries)
}

func TokenHandler(c *gin.Context) {
	var req tokenReq

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input !"})
		return
	}

	refreshToken, err := verifyToken(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

    if refreshToken == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

    newToken, err := generateToken(req.UserId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, newToken)
}

func VerifyHandler(c *gin.Context) {
    authHeader := c.GetHeader("Authorization")
    const bearerPrefix = "Bearer "

    if authHeader == "" || !strings.HasPrefix(authHeader, bearerPrefix) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    tokenStr := strings.TrimPrefix(authHeader, bearerPrefix)
    if tokenStr == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    db := database.GetDatabase()
    var token models.RefreshToken
    err := db.
        Where("token = ? AND is_active = TRUE AND expires_at > ?", tokenStr, time.Now()).
        First(&token).
        Error

    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        } else {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal error"})
        }
        return
    }

    c.Status(http.StatusOK)
}