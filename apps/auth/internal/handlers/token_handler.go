package handlers

import (
	"database/sql"
	"gl26_ecohome/auths/internal/database"
	"gl26_ecohome/auths/internal/models"
	"gl26_ecohome/auths/pkg/utils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	TOKEN_DURATION = 36 * time.Hour
)

type tokenReq struct {
	UserId       string `json:"user_id"`
	RefreshToken string `json:"refresh_token"`
}

func verifyToken(c *gin.Context, db *sql.DB, req *tokenReq) *models.RefreshToken {
	query := `select id, user_id, refresh_token, expires_at, created_at
		from refresh_tokens
		where refresh_token = $1
		and user_id = $2
		and is_active = TRUE
		and expires_at > NOW()`

	var refreshToken models.RefreshToken
	err := db.QueryRow(query, req.RefreshToken, req.UserId).Scan(
		&refreshToken.Id, &refreshToken.UserId, &refreshToken.Token,
		&refreshToken.ExpiresAt, &refreshToken.CreatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired refresh token !"})
		return nil
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error !"})
		return nil
	}

	return &refreshToken
}

func generateToken(c *gin.Context, db *sql.DB, userId string) *models.RefreshToken {
	// Deactivate old token
	if _, err := db.Exec(`update refresh_tokens set is_active = FALSE where user_id = $1`, userId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to deactivate old token !"})
		return nil
	}

	// Generate new token
	expiresAt := time.Now().Add(TOKEN_DURATION)
	newToken, err := utils.GenerateRandomKey(128)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate new token !"})
		return nil
	}

	// Insert new refresh token into database
	if _, err := db.Exec(`insert into refresh_tokens (user_id, refresh_token, expires_at) values ($1, $2, $3)`, userId, newToken, expiresAt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save new token !"})
		return nil
	}

	return &models.RefreshToken{UserId: userId, Token: newToken, ExpiresAt: expiresAt}
}

func TokenHandler(c *gin.Context) {
	db := database.GetDatabase()
	var req tokenReq

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input !"})
		return
	}

	// Verify token validity
	refreshToken := verifyToken(c, db, &req)
	if refreshToken == nil {
		return
	}

	// Generate new token
	newToken := generateToken(c, db, req.UserId)
	if newToken == nil {
		return
	}

	// Return new refresh token
	c.JSON(http.StatusOK, newToken)
}

func VerifyHandler(c *gin.Context) {
	db := database.GetDatabase()
	var req tokenReq

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input !"})
		return
	}

	if refreshToken := verifyToken(c, db, &req); refreshToken != nil {
		c.JSON(http.StatusOK, gin.H{"message": "Token is valid !"})
	}
}
