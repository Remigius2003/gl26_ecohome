package models

const (
	SCORE = 0
	KILL  = 1
)

type LeaderboardRow struct {
	Username string `json:"username"`
	UserId   string `json:"id"`
	Value    int    `json:"value"`
	Type     uint   `json:"type"`
	Rank     int    `json:"rank"`
}
