package handlers

import (
	"encoding/json"
	"fmt"
	"gl26_ecohome/auths/internal/models"
	"gl26_ecohome/auths/pkg/utils"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	SECRET_KEYS_FILE = "data/secret_keys.json"
	JWT_DURATION = 42 * time.Minute
)

var (
	secretKeyMu     sync.RWMutex
	currentKey      models.JWTSecretKey
	nextKey         models.JWTSecretKey
	oldKey          models.JWTSecretKey
)

func saveSecretKeys() error {
	secretKeyMu.RLock()
	secretKeys := map[string]models.JWTSecretKey{
		"current": currentKey,
		"next":    nextKey,
		"old":     oldKey,
	}
	secretKeyMu.RUnlock()

	data, err := json.Marshal(secretKeys)
	if err != nil {
		return err
	}

	return os.WriteFile(SECRET_KEYS_FILE, data, 0644)
}

func loadSecretKeys() error {
	if _, err := os.Stat(SECRET_KEYS_FILE); os.IsNotExist(err) {
		var currKey, _ = utils.GenerateRandomKey(32)
		var nKey, _ = utils.GenerateRandomKey(32)

		secretKeyMu.Lock()
		currentKey = models.JWTSecretKey{
			Id:        1,
			Key:       currKey,
			CreatedAt: time.Now().Unix(),
		}
		nextKey = models.JWTSecretKey{
			Id:        2,
			Key:       nKey,
			CreatedAt: time.Now().Add(15 * time.Minute).Unix(),
		}
		oldKey = models.JWTSecretKey{}
		secretKeyMu.Unlock()
		return saveSecretKeys()
	}

	data, err := os.ReadFile(SECRET_KEYS_FILE)
	if err != nil {
		return err
	}

	var keys map[string]models.JWTSecretKey
	if err := json.Unmarshal(data, &keys); err != nil {
		return err
	}

	secretKeyMu.Lock()
	currentKey = keys["current"]
	nextKey = keys["next"]
	oldKey = keys["old"]
	secretKeyMu.Unlock()

	return nil
}

func rotateSecretKeys() {
	var newKey, _ = utils.GenerateRandomKey(32)

	secretKeyMu.Lock()
	oldKey = currentKey
	currentKey = nextKey
	nextKey = models.JWTSecretKey{
		Id:        currentKey.Id + 1,
		Key:       newKey,
		CreatedAt: time.Now().Add(15 * time.Minute).Unix(),
	}
	secretKeyMu.Unlock()

	if err := saveSecretKeys(); err != nil {
		fmt.Printf("Key rotation failed: %v\n", err)
	}
}

func StartSecretKeysRotation() {
	if err := loadSecretKeys(); err != nil {
		fmt.Printf("Failed to load/generate secret keys: %v\n", err)
	}

	ticker := time.NewTicker(15 * time.Minute)
	go func() {
		for range ticker.C {
			rotateSecretKeys()
		}
	}()
}

func SecretKeyHandler(c *gin.Context) {
	secretKeyMu.RLock()
	k := currentKey
	secretKeyMu.RUnlock()

	c.JSON(http.StatusOK, gin.H{"secretKey": k})
}

func SecretKeysHandler(c *gin.Context) {
	secretKeyMu.RLock()
	c.JSON(http.StatusOK, gin.H{
		"current": currentKey,
		"next":    nextKey,
		"old":     oldKey,
	})
	secretKeyMu.RUnlock()
}

func JWTHandler(c *gin.Context) {
	var req struct {
		UserId uint `json:"user_id"`
		Token  string `json:"refresh_token"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	refreshToken, err := verifyToken(&tokenReq{
		UserId: req.UserId,
		Token: req.Token,
	})
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

    if refreshToken == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	secretKeyMu.RLock()
	key := currentKey.Key
	secretKeyMu.RUnlock()

	expiration := time.Now().Add(JWT_DURATION)
	token, err := utils.GenerateJWT(req.UserId, expiration, key)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate JWT"})
		return
	}

	c.JSON(http.StatusOK, models.JWTToken{
		Token:     token,
		ExpiresAt: expiration,
	})
}