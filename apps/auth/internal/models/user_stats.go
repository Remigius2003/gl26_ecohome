package models

type UserStats struct {
	TotalScore       int     `json:"total_score"`
	TotalKills       int     `json:"total_kills"`
	TotalTimeAlive   string  `json:"total_time_alive"`
	TotalGamesPlayed int     `json:"total_games_played"`
	KDA              float64 `json:"total_kda"`
}
