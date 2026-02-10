package handlers

import (
	"errors"
	"fmt"
	"gl26_ecohome/auths/internal/database"
	"gl26_ecohome/auths/internal/models"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func RegisterHandler(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hash),
	}

	if err := database.GetDatabase().Create(&user).Error; err != nil {
		log.Println(err.Error())
		c.JSON(http.StatusConflict, gin.H{"error": "Username or email already taken"})
		return
	}

	c.JSON(http.StatusCreated, user)
}

func LoginHandler(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if (req.Username == "" && req.Email == "") || (req.Username != "" && req.Email != "") || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Required field is missing"})
		return
	}

	db := database.GetDatabase()
	var user models.User

	field := "username"
	identifier := req.Username
	if req.Email != "" {
		field = "email"
		identifier = req.Email
	}

	if err := db.Where(field+" = ?", identifier).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Server error"})
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := generateToken(user.Id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user_id": user.Id, "token": token})
}

func ChangePasswordHandler(c *gin.Context) {
	var req models.ChangePasswordRequest
	userID := c.GetUint("user_id")

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var user models.User
	db := database.GetDatabase()
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.OldPassword)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Hash failure"})
		return
	}

	user.PasswordHash = string(hash)
	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
		return
	}

	c.JSON(http.StatusOK, "Password updated successfully")
}

func LogoutHandler(c *gin.Context) {
	var req models.LogoutRequest
	userID := c.GetUint("user_id")

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	token, err := verifyToken(userID, req.RefreshToken)
	if err != nil || token == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := database.GetDatabase().Model(&models.RefreshToken{}).
		Where("id = ?", token.Id).Update("is_active", false).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Logout failed"})
		return
	}

	c.JSON(http.StatusOK, "Logged out")
}

func DeleteAccountHandler(c *gin.Context) {
	var req models.DeleteAccountRequest
	userID := c.GetUint("user_id")

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if _, err := verifyToken(userID, req.RefreshToken); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	var user models.User
	db := database.GetDatabase()
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	anon := fmt.Sprintf("deleted_%d_%d", userID, time.Now().Unix())
	user.Username = anon
	user.Email = anon + "@deleted.local"
	user.PasswordHash = ""
	user.IsActive = false

	tx := db.Begin()
	if err := tx.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete account"})
		tx.Rollback()
		return
	}

	tx.Model(&models.RefreshToken{}).Where("user_id = ?", userID).Update("is_active", false)
	tx.Commit()

	c.JSON(http.StatusOK, gin.H{"message": "Account anonymised"})
}

func ChangeUsernameHandler(c *gin.Context) {
	var req models.ChangeUsernameRequest
	userID := c.GetUint("user_id")

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if err := database.GetDatabase().Model(&models.User{}).
		Where("id = ?", userID).Update("username", req.Username).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username taken"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Username updated"})
}
