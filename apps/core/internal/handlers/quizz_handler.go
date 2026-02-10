package handlers

import (
	"gl26_ecohome/core/internal/database"
	"gl26_ecohome/core/internal/models"
	"gl26_ecohome/core/internal/services"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func GetQuizzData(c *gin.Context) {
	category := c.Query("category")
	if category == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Category required"})
		return
	}

	cm := services.GetContentManager()
	questions, ok := cm.GetQuizzQuestions(category)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":        category,
		"rootId":    "Q1",
		"questions": questions,
	})
}

func SubmitQuizzResult(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var payload struct {
		Category string  `json:"category"`
		Emission float64 `json:"emission"`
	}

	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	result := models.QuizzResult{
		UserID:   userID,
		Category: payload.Category,
		Emission: payload.Emission,
		Date:     time.Now(),
	}

	db := database.GetDatabase()
	if err := db.Create(&result).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save result"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func GetQuizzHistory(c *gin.Context) {
	userID := c.GetString("user_id")
	category := c.Query("category")

	db := database.GetDatabase()
	var results []models.QuizzResult

	query := db.Where("user_id = ?", userID)
	if category != "" {
		query = query.Where("category = ?", category)
	}

	query.Order("date asc").Find(&results)

	response := make([]gin.H, len(results))
	for i, r := range results {
		response[i] = gin.H{
			"date":     r.Date,
			"emission": r.Emission,
			"category": r.Category,
		}
	}

	c.JSON(http.StatusOK, response)
}
