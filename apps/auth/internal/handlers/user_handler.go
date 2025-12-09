package handlers

import (
	"database/sql"
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

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password !"})
		return
	}

	// Insert user into database
	var user models.User
	query := `insert into users (username, email, password_hash) values ($1, $2, $3) returning id`
	if err := db.QueryRow(query, req.Username, req.Email, string(hashedPassword)).Scan(&user.Id); err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username or email already taken !"})
		return
	}

	// Return new user
	user.Username = req.Username
	user.Email = req.Email
	user.IsActive = true
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

	// Check if we have username/email but not both at the same time
	if (req.Username == "" && req.Email == "") || (req.Username != "" && req.Email != "") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Provide either username or email, not both !"})
		return
	}

	// Retrive user from database
	var user models.User
	err := db.QueryRow(`select id, username, password_hash from users where (username = $1 or email = $2) limit 1`,
		req.Username, req.Email).Scan(&user.Id, &user.Username, &user.PasswordHash)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username, email or password !"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error !"})
		return
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username, email or password !"})
		return
	}

	// Generate and return token
	token := generateToken(c, db, user.Id)
	if token == nil {
		return
	}

	c.JSON(http.StatusOK, token)
}

func InfosHandler(c *gin.Context) {
	db := database.GetDatabase()
	userId := c.Query("id")

	var user models.User
	err := db.QueryRow(`select id, username, email, is_active, created_at from users where id = $1 limit 1`,
		userId).Scan(&user.Id, &user.Username, &user.Email, &user.IsActive, &user.CreatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found !"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error !"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func LogoutHandler(c *gin.Context) {
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

	// Deactivate all refresh tokens
	_, err := db.Exec(`update refresh_tokens set is_active = FALSE where user_id = $1`, req.UserId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to logout !"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully !"})
}
