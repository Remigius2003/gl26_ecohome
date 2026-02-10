package handlers

import (
	"fmt"
	"gl26_ecohome/core/internal/database"
	"gl26_ecohome/core/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SearchUsersHandler(c *gin.Context) {
	db := database.GetDatabase()
	query := c.Query("q")
	
	if len(query) < 3 {
		c.JSON(http.StatusOK, []models.PublicProfile{})
		return
	}

	type Result struct {
		Id        uint
		Username  string
		AvatarURL string
	}

	var users []models.User
	db.Where("LOWER(username) LIKE ?", "%"+query+"%").Limit(10).Find(&users)

	results := make([]models.PublicProfile, 0)
	for _, u := range users {
		results = append(results, models.PublicProfile{
			UserID:    u.Id, 
			Username:  u.Username, 
			AvatarURL: fmt.Sprintf("/users/avatar/%d", u.Id),
		})
	}

	c.JSON(http.StatusOK, results)
}

func SendFriendRequestHandler(c *gin.Context) {
	db := database.GetDatabase()
	requesterID := c.MustGet("user_id").(uint)
	
	var input struct { TargetID uint `json:"target_id"` }
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if requesterID == input.TargetID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot add yourself"})
		return
	}

	var count int64
	db.Model(&models.User{}).Where("id = ?", input.TargetID).Count(&count)
	if count == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Target user not found"})
		return
	}

	var existing models.Friendship
	err := db.Where("(requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)", 
		requesterID, input.TargetID, input.TargetID, requesterID).First(&existing).Error

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Friendship or request already exists"})
		return
	}

	req := models.Friendship{
		RequesterID: requesterID,
		AddresseeID: input.TargetID,
		Status:      models.StatusPending,
	}
	
	if err := db.Create(&req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send request"})
		return
	}
	
	c.JSON(http.StatusCreated, gin.H{"message": "Request sent"})
}

func RespondFriendRequestHandler(c *gin.Context) {
	db := database.GetDatabase()
	userID := c.MustGet("user_id").(uint)

	var input models.FriendRequestAction
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var req models.Friendship
	err := db.Where("requester_id = ? AND addressee_id = ? AND status = ?", 
		input.TargetID, userID, models.StatusPending).First(&req).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
		return
	}

	if input.Action == "accept" {
		req.Status = models.StatusAccepted
		if err := db.Save(&req).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Accepted"})
	} else {
		db.Delete(&req)
		c.JSON(http.StatusOK, gin.H{"message": "Rejected"})
	}
}

func ListFriendsHandler(c *gin.Context) {
	db := database.GetDatabase()
	userID := c.MustGet("user_id").(uint)
	
	type FriendResult struct {
		UserID   uint
		Username string
		Bio      string
	}

	var results []FriendResult
	
	query := `
		SELECT u.id as user_id, u.username, p.bio
		FROM users u
		LEFT JOIN profiles p ON p.user_id = u.id
		JOIN friendships f ON (f.requester_id = u.id OR f.addressee_id = u.id)
		WHERE (f.requester_id = ? OR f.addressee_id = ?)
		AND f.status = 'ACCEPTED'
		AND u.id != ?
	`

	if err := db.Raw(query, userID, userID, userID).Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch friends"})
		return
	}

	response := make([]models.PublicProfile, len(results))
	for i, r := range results {
		avatarUrl := fmt.Sprintf("/users/avatar/%d", r.UserID) 
		
		response[i] = models.PublicProfile{
			UserID:    r.UserID,
			Username:  r.Username,
			Bio:       r.Bio,
			AvatarURL: avatarUrl,
		}
	}

	c.JSON(http.StatusOK, response)
}

func ListRequestsHandler(c *gin.Context) {
	db := database.GetDatabase()
	userID := c.MustGet("user_id").(uint)

	var requests []models.PublicProfile	
	query := `
		SELECT u.id as user_id, u.username
		FROM users u
		JOIN friendships f ON f.requester_id = u.id
		WHERE f.addressee_id = ? AND f.status = 'PENDING'
	`
	
	if err := db.Raw(query, userID).Scan(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch requests"})
		return
	}

	c.JSON(http.StatusOK, requests)
}