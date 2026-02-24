package ws

import (
	"encoding/json"
	"log"
	"sync"
)

type Context struct {
	Client  *Client
	Payload json.RawMessage
}

type HandlerFunc func(ctx *Context) error

type Manager struct {
	handlers map[string]HandlerFunc
	mu       sync.RWMutex
	Hub      *Hub
}

var (
	GlobalManager *Manager
	once          sync.Once
)

func GetManager() *Manager {
	once.Do(func() {
		hub := NewHub()

		GlobalManager = &Manager{
			handlers: make(map[string]HandlerFunc),
			Hub:      hub,
		}

		hub.Manager = GlobalManager
		go hub.Run()
	})
	return GlobalManager
}

func (m *Manager) On(event string, handler HandlerFunc) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.handlers[event] = handler
}

func (m *Manager) Dispatch(client *Client, rawMsg []byte) {
	var envelope struct {
		Type    string          `json:"type"`
		Payload json.RawMessage `json:"payload"`
	}

	if err := json.Unmarshal(rawMsg, &envelope); err != nil {
		log.Printf("WS: Invalid JSON format: %v", err)
		return
	}

	m.mu.RLock()
	handler, exists := m.handlers[envelope.Type]
	m.mu.RUnlock()

	if !exists {
		log.Printf("WS: No handler for event type: %s", envelope.Type)
		return
	}

	ctx := &Context{
		Client:  client,
		Payload: envelope.Payload,
	}

	if err := handler(ctx); err != nil {
		log.Printf("WS: Error in handler for %s: %v", envelope.Type, err)
	}
}
