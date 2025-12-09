package handlers

import (
	"encoding/json"
	"fmt"
	"gl26_ecohome/auths/internal/models"
	"gl26_ecohome/auths/pkg/utils"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	SECRET_KEYS_FILE = "data/secret_keys.json"
)

var currentSecretKey models.JWTSecretKey
var nextSecretKey models.JWTSecretKey
var oldSecretKey models.JWTSecretKey

func saveSecretKeys() error {
	secretKeys := map[string]models.JWTSecretKey{
		"current": currentSecretKey,
		"next":    nextSecretKey,
		"old":     oldSecretKey,
	}

	data, err := json.Marshal(secretKeys)
	if err != nil {
		return err
	}

	err = os.WriteFile(SECRET_KEYS_FILE, data, 0644)
	if err != nil {
		return err
	}

	return nil
}

func loadSecretKeys() error {
	if _, err := os.Stat(SECRET_KEYS_FILE); os.IsNotExist(err) {
		currentSecretKey.CreatedAt = time.Now().Unix()
		currentSecretKey.Key, _ = utils.GenerateRandomKey(32)
		currentSecretKey.Id = 1

		nextSecretKey.CreatedAt = time.Now().Add(15 * time.Minute).Unix()
		nextSecretKey.Key, _ = utils.GenerateRandomKey(32)
		nextSecretKey.Id = currentSecretKey.Id + 1

		oldSecretKey.CreatedAt = 0
		oldSecretKey.Key = "N/A"
		oldSecretKey.Id = 0

		err := saveSecretKeys()
		if err != nil {
			return err
		}
		return nil
	}

	data, err := os.ReadFile(SECRET_KEYS_FILE)
	if err != nil {
		return err
	}

	var secretKeys map[string]models.JWTSecretKey
	err = json.Unmarshal(data, &secretKeys)
	if err != nil {
		return err
	}

	currentSecretKey = secretKeys["current"]
	nextSecretKey = secretKeys["next"]
	oldSecretKey = secretKeys["old"]

	return nil
}

func rotateSecretKeys() error {
	oldSecretKey = currentSecretKey
	currentSecretKey = nextSecretKey

	nextSecretKey.CreatedAt = time.Now().Add(15 * time.Minute).Unix()
	nextSecretKey.Key, _ = utils.GenerateRandomKey(32)
	nextSecretKey.Id = currentSecretKey.Id + 1

	err := saveSecretKeys()
	if err != nil {
		fmt.Printf("Failed while rotating keys: %v\n", err)
	}
	return nil
}

func StartSecretKeysRotation() {
	if err := loadSecretKeys(); err != nil {
		fmt.Printf("Failed to load/generate the secret keys: %v\n", err)
	}

	ticker := time.NewTicker(15 * time.Minute)
	for range ticker.C {
		rotateSecretKeys()
	}
}

func SecretKeyHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"secretKey": currentSecretKey,
	})
}

func SecretKeysHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"current": currentSecretKey,
		"next":    nextSecretKey,
		"old":     oldSecretKey,
	})
}
