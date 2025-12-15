package handlers

import (
	"gl26_ecohome/auths/internal/database"
	"gl26_ecohome/auths/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func RegisterHandler(c *gin.Context) {
	db := database.GetDatabase()

	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
		Email    string `json:"email"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input !"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password !"})
		return
	}

	user := models.User{
        Username:     req.Username,
        Email:        req.Email,
        PasswordHash: string(hash),
    }

	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username or email already taken"})
		return
	}

	c.JSON(http.StatusCreated, user)
}

func LoginHandler(c *gin.Context) {
	db := database.GetDatabase()
	
	var req struct {
		Username string `json:"username,omitempty"`
		Email    string `json:"email,omitempty"`
		Password string `json:"password"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input !"})
		return
	}

	if (req.Username == "" && req.Email == "") ||
		(req.Username != "" && req.Email != "") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Provide username OR email"})
		return
	}

	var user models.User
	if req.Username != "" {
		db.Where("username = ?", req.Username).First(&user)
	} else {
		db.Where("email = ?", req.Email).First(&user)
	}

	if user.Id == 0 {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
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

func InfosHandler(c *gin.Context) {
	db := database.GetDatabase()
	id := c.Query("id")

	var user models.User
	if err := db.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	
    c.JSON(http.StatusOK, user)
}

func LogoutHandler(c *gin.Context) {
	db := database.GetDatabase()

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

	db.Model(&models.RefreshToken{}).
		Where("user_id = ?", req.UserId).
		Update("is_active", false)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
}
