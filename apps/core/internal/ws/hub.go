package ws

import (
	"encoding/json"
	"log"
	"sync"
)

type Hub struct {
	clients    map[uint]map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex

	Manager *Manager
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[uint]map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if h.clients[client.UserId] == nil {
				h.clients[client.UserId] = make(map[*Client]bool)
			}
			h.clients[client.UserId][client] = true
			h.mu.Unlock()

			log.Printf("User %d connected. Total connections for user: %d", client.UserId, len(h.clients[client.UserId]))

		case client := <-h.unregister:
			h.mu.Lock()
			if userClients, ok := h.clients[client.UserId]; ok {
				if _, ok := userClients[client]; ok {
					delete(userClients, client)
					close(client.Send)

					if len(userClients) == 0 {
						delete(h.clients, client.UserId)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("User %d disconnected", client.UserId)

		case message := <-h.broadcast:
			h.mu.Lock()
			for uid, userClients := range h.clients {
				for client := range userClients {
					select {
					case client.Send <- message:
					default:
						close(client.Send)
						delete(userClients, client)
					}
				}
				if len(userClients) == 0 {
					delete(h.clients, uid)
				}
			}
			h.mu.Unlock()
		}
	}
}

func (h *Hub) SendToUser(targetId uint, message interface{}) {
	msgBytes, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling WS message: %v", err)
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	userClients, ok := h.clients[targetId]
	if !ok {
		return
	}

	for client := range userClients {
		select {
		case client.Send <- msgBytes:
		default:
			close(client.Send)
			delete(userClients, client)
		}
	}
}
