package models

type GameHistory struct {
	Score     int    `json:"score"`
	ShipModel string `json:"ship_model"`
	Kills     int    `json:"kills"`
	TimeAlive string `json:"time_alive"`
	CreatedAt string `json:"created_at"`
}
