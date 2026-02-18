package services

import (
	"encoding/json"
	"fmt"
	"gl26_ecohome/core/internal/models"
	"log"
	"math/rand"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

type ContentManager struct {
	Quizzes map[string]map[string]models.Question
	DefiMap map[string]models.DefiDefinition
	Defis   []models.DefiDefinition
	mu      sync.RWMutex
}

var (
	manager *ContentManager
	once    sync.Once
)

func GetContentManager() *ContentManager {
	once.Do(func() {
		manager = &ContentManager{
			Quizzes: make(map[string]map[string]models.Question),
			Defis:   make([]models.DefiDefinition, 0),
			DefiMap: make(map[string]models.DefiDefinition),
		}
	})
	return manager
}

func (cm *ContentManager) LoadContent(rootPath string) error {
	cm.mu.Lock()
	defer cm.mu.Unlock()

	log.Printf("Loading content from %s...", rootPath)

	quizzRoot := filepath.Join(rootPath, "quizz")
	err := filepath.Walk(quizzRoot, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(info.Name(), ".json") {
			dir := filepath.Dir(path)
			category := filepath.Base(dir)

			data, err := os.ReadFile(path)
			if err != nil {
				return fmt.Errorf("error reading %s: %v", path, err)
			}

			var bloc models.QuizzBloc
			if err := json.Unmarshal(data, &bloc); err != nil {
				return fmt.Errorf("error parsing %s: %v", path, err)
			}

			if _, ok := cm.Quizzes[category]; !ok {
				cm.Quizzes[category] = make(map[string]models.Question)
			}
			for k, v := range bloc {
				cm.Quizzes[category][k] = v
			}
		}
		return nil
	})
	if err != nil {
		log.Printf("Warning loading quizzes: %v", err)
	}

	defiRoot := filepath.Join(rootPath, "defi")
	err = filepath.Walk(defiRoot, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(info.Name(), ".json") {
			data, err := os.ReadFile(path)
			if err != nil {
				return err
			}

			var defis []models.DefiDefinition
			if err := json.Unmarshal(data, &defis); err != nil {
				return fmt.Errorf("error parsing defi file %s: %v", path, err)
			}

			cm.Defis = append(cm.Defis, defis...)
			for _, d := range defis {
				cm.DefiMap[d.Id] = d
			}
		}
		return nil
	})
	if err != nil {
		log.Printf("Warning loading defis: %v", err)
	}

	log.Printf("Loaded %d quiz categories and %d challenges.", len(cm.Quizzes), len(cm.Defis))
	return nil
}

func (cm *ContentManager) GetQuizzQuestions(category string) (map[string]models.Question, bool) {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	q, ok := cm.Quizzes[category]
	return q, ok
}

func (cm *ContentManager) GetDefi(id string) (models.DefiDefinition, bool) {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	d, ok := cm.DefiMap[id]
	return d, ok
}

func (cm *ContentManager) GetRandomDefis(n int) []models.DefiDefinition {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	if len(cm.Defis) == 0 {
		return []models.DefiDefinition{}
	}

	// Shuffle copy
	indices := rand.Perm(len(cm.Defis))
	result := make([]models.DefiDefinition, 0, n)

	count := 0
	for _, idx := range indices {
		result = append(result, cm.Defis[idx])
		count++
		if count >= n {
			break
		}
	}
	return result
}
