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

func verifyToken(userId uint, tokenStr string) (*models.RefreshToken, error) {
	var token models.RefreshToken
	db := database.GetDatabase()

	err := db.Where("token = ? AND user_id = ? AND is_active = TRUE AND expires_at > ?",
		tokenStr, userId, time.Now()).First(&token).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("token not found or expired")
	}

	return &token, err
}

func generateToken(userId uint) (*models.RefreshToken, error) {
	db := database.GetDatabase()
	db.Model(&models.RefreshToken{}).Where("user_id = ?", userId).Update("is_active", false)

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
			if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "UNIQUE") {
				continue
			}
			return nil, fmt.Errorf("failed to save token: %w", err)
		}

		return &token, nil
	}

	return nil, fmt.Errorf("failed to generate unique token")
}

func TokenHandler(c *gin.Context) {
	var req models.TokenRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if _, err := verifyToken(req.UserId, req.RefreshToken); err != nil {
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
	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

	if tokenStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var token models.RefreshToken
	err := database.GetDatabase().Where("token = ? AND is_active = TRUE AND expires_at > ?",
		tokenStr, time.Now()).First(&token).Error

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	c.Status(http.StatusOK)
}
