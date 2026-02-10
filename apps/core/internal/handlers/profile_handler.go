package handlers

import (
	"errors"
	"fmt"
	"gl26_ecohome/core/internal/database"
	"gl26_ecohome/core/internal/models"
	"io"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func generateAvatarURL(c *gin.Context, userID uint) string {
	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	return fmt.Sprintf("%s://%s/users/avatar/%d", scheme, c.Request.Host, userID)
}

func GetProfileHandler(c *gin.Context) {
	requestingUserID := c.MustGet("user_id").(uint)
	userIDParam := c.Query("id")
	db := database.GetDatabase()

	var targetID uint
	if userIDParam == "" {
		targetID = requestingUserID
	} else {
		id, _ := strconv.Atoi(userIDParam)
		targetID = uint(id)
	}

	var user models.User
	if err := db.First(&user, targetID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var profile models.Profile
	err := db.Where("user_id = ?", targetID).First(&profile).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		profile = models.Profile{
			UserID:        targetID,
			Bio:           "New Player, here to save the planet !",
			IsGraphPublic: false,
		}
		if err := db.Create(&profile).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create profile"})
			return
		}
		db.Where("user_id = ?", targetID).First(&profile)
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch profile"})
		return
	}

	response := models.PublicProfile{
		UserID:        user.Id,
		Username:      user.Username,
		Bio:           profile.Bio,
		IsGraphPublic: profile.IsGraphPublic,
	}

	if len(profile.AvatarData) > 0 {
		response.AvatarURL = generateAvatarURL(c, user.Id)
	}

	c.JSON(http.StatusOK, response)
}

func UpdateProfileHandler(c *gin.Context) {
	db := database.GetDatabase()
	userID := c.MustGet("user_id").(uint)

	var input struct {
		Bio           string `json:"bio"`
		IsGraphPublic bool   `json:"is_graph_public"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var profile models.Profile
	if err := db.First(&profile, userID).Error; err != nil {
		profile = models.Profile{UserID: userID}
	}

	profile.Bio = input.Bio
	profile.IsGraphPublic = input.IsGraphPublic

	if err := db.Save(&profile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_id":         userID,
		"bio":             profile.Bio,
		"is_graph_public": profile.IsGraphPublic,
		"avatar_url":      generateAvatarURL(c, userID),
	})
}

func UploadAvatarHandler(c *gin.Context) {
	db := database.GetDatabase()
	userID := c.MustGet("user_id").(uint)

	log.Print("t0")

	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 2<<20)

	file, header, err := c.Request.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image file is required (key: 'avatar')"})
		return
	}
	defer file.Close()

	log.Print("t1")

	contentType := header.Header.Get("Content-Type")
	if contentType != "image/png" && contentType != "image/jpeg" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only PNG or JPEG allowed"})
		return
	}

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
		return
	}

	var profile models.Profile
	if err := db.First(&profile, userID).Error; err != nil {
		profile = models.Profile{UserID: userID}
	}

	profile.AvatarData = fileBytes
	profile.AvatarType = contentType

	if err := db.Save(&profile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Avatar updated",
		"url":     generateAvatarURL(c, userID),
	})
}

func GetAvatarHandler(c *gin.Context) {
	db := database.GetDatabase()
	targetID := c.Param("id")

	var profile models.Profile
	if err := db.Select("avatar_data", "avatar_type").First(&profile, targetID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Avatar not found"})
		return
	}

	if len(profile.AvatarData) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No avatar set"})
		return
	}

	c.Data(http.StatusOK, profile.AvatarType, profile.AvatarData)
}
