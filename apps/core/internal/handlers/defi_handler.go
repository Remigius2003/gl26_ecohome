package handlers

import (
	"gl26_ecohome/core/internal/database"
	"gl26_ecohome/core/internal/models"
	"gl26_ecohome/core/internal/services"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func GetDailyDefis(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	db := database.GetDatabase()
	cm := services.GetContentManager()
	today := time.Now().Truncate(24 * time.Hour)

	var userDefis []models.DailyDefi
	result := db.Where("user_id = ? AND date_assigned = ?", userID, today).Find(&userDefis)

	if result.Error == nil && len(userDefis) == 0 {
		generated := cm.GetRandomDefis(3)
		for _, def := range generated {
			assignment := models.DailyDefi{
				UserId:       userID,
				DefiId:       def.Id,
				DateAssigned: today,
				Status:       "PENDING",
				RewardEarned: 0,
			}
			db.Create(&assignment)
			userDefis = append(userDefis, assignment)
		}
	}

	response := make([]gin.H, 0, len(userDefis))
	for _, ud := range userDefis {
		content, ok := cm.GetDefi(ud.DefiId)
		if !ok {
			continue
		}
		response = append(response, gin.H{
			"id":            content.Id,
			"defi":          content.Defi,
			"category":      content.Category,
			"leafReward":    content.LeafReward,
			"overQuestions": content.OverQuestions,
			"status":        ud.Status,
			"earned":        ud.RewardEarned,
		})
	}

	c.JSON(http.StatusOK, response)
}

func CompleteDefi(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var req struct {
		DefiID   string `json:"defiId"`
		AnswerID string `json:"answerId"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	cm := services.GetContentManager()
	defiContent, ok := cm.GetDefi(req.DefiID)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "Defi definition not found"})
		return
	}

	db := database.GetDatabase()
	today := time.Now().Truncate(24 * time.Hour)

	var assignment models.DailyDefi
	if err := db.Where("user_id = ? AND defi_id = ? AND date_assigned = ?", userID, req.DefiID, today).
		First(&assignment).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Challenge not assigned for today"})
		return
	}

	if assignment.Status == "COMPLETED" || assignment.Status == "FAILED" {
		c.JSON(http.StatusConflict, gin.H{"error": "Already resolved"})
		return
	}

	rewardToGrant := defiContent.LeafReward
	if defiContent.OverQuestions != nil {
		matched := false
		for _, ans := range defiContent.OverQuestions.Responses {
			if ans.Id != req.AnswerID {
				continue
			}
			matched = true

			if ans.LeafReward == 0 {
				assignment.Status = "FAILED"
				assignment.RewardEarned = 0
				db.Save(&assignment)

				c.JSON(http.StatusOK, gin.H{"status": "WRONG", "reward": 0})
				return
			}

			rewardToGrant = ans.LeafReward
			break
		}
		if !matched {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid answer ID"})
			return
		}
	}

	assignment.Status = "COMPLETED"
	assignment.RewardEarned = rewardToGrant
	db.Save(&assignment)

	// TODO: Update the user's total leaf balance.
	// db.Model(&models.Profile{}).Where("user_id = ?", userID).
	//   Update("leaves", gorm.Expr("leaves + ?", rewardToGrant))

	c.JSON(http.StatusOK, gin.H{"status": "COMPLETED", "reward": rewardToGrant})
}
