package handlers

import (
	"errors"
	"gl26_ecohome/auths/internal/database"
	"gl26_ecohome/auths/internal/models"
	"gl26_ecohome/auths/pkg/utils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const TOKEN_DURATION = 36 * time.Hour
type tokenReq struct {
	UserId       uint `json:"user_id"`
	RefreshToken string `json:"refresh_token"`
}

func verifyToken(req *tokenReq) (*models.RefreshToken, error) {
    db := database.GetDatabase()

    var token models.RefreshToken
    err := db.
        Where("token = ? AND user_id = ? AND is_active = TRUE AND expires_at > ?", 
              req.RefreshToken, req.UserId, time.Now()).
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
		return nil, err
	}
    
	return &token, nil
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
	var req tokenReq

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	token, err := verifyToken(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if token == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{})
}
