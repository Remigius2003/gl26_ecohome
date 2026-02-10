package authclient

import (
	"encoding/json"
	"fmt"
	"gl26_ecohome/core/config"
	"gl26_ecohome/core/internal/models"
	"io"
	"net/http"
	"sync"
	"time"
)

var (
	keysMu     sync.RWMutex
	secretKeys *models.SecretKeysResponse
)

func GetSecretKeys() *models.SecretKeysResponse {
	keysMu.RLock()

	if secretKeys != nil {
		keysMu.RUnlock()
		return secretKeys
	}
	keysMu.RUnlock()

	_ = FetchSecretKeys()

	keysMu.RLock()
	defer keysMu.RUnlock()

	return secretKeys
}

func FetchSecretKeys() error {
	cfg := config.GetConfig()
	url := fmt.Sprintf("%s/jwt/secretKeys", cfg.AuthServiceURL)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}

	req.Header.Set("AUTH-API-KEY", cfg.AuthServiceKey)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error contacting Auth service: %v\n", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("auth service returned status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	var keys models.SecretKeysResponse
	if err := json.Unmarshal(body, &keys); err != nil {
		return err
	}

	keysMu.Lock()
	secretKeys = &keys
	keysMu.Unlock()

	fmt.Println("Successfully updated JWT Secret Keys from Auth Service")
	return nil
}

func StartSecretKeysRotation() {
	if err := FetchSecretKeys(); err != nil {
		panic(err)
	}

	ticker := time.NewTicker(10 * time.Minute)
	go func() {
		for range ticker.C {
			if err := FetchSecretKeys(); err != nil {
				fmt.Println("Failed to refresh keys:", err)
			}
		}
	}()
}
