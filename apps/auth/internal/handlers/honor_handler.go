package handlers

import (
	"database/sql"
	"fmt"
	"gl26_ecohome/auths/internal/database"
	"gl26_ecohome/auths/internal/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

const (
	LIMIT = 50
	ALL   = 0
	DAY   = 1
	WEEK  = 2
	MONTH = 3
)

var timeFrames = map[uint]string{
	ALL:   "1=1",
	DAY:   "created_at >= NOW() - INTERVAL '1 day'",
	WEEK:  "created_at >= NOW() - INTERVAL '1 week'",
	MONTH: "created_at >= NOW() - INTERVAL '1 month'",
}

func fetchLeaderboard(db *sql.DB, category uint, condition string, limit, offset int) []models.LeaderboardRow {
	column := "score"
	if category == models.KILL {
		column = "kills"
	}

	query := `select u.id, u.username, ` + column + `as value
		from play_history ph, users u
		where ph.user_id = u.id
		and ` + condition + `
		order by value desc
		limit $1 offset $2`

	rows, err := db.Query(query, limit, offset)
	if err != nil {
		return []models.LeaderboardRow{}
	}

	defer rows.Close()
	rank := offset + 1
	var leaderboard []models.LeaderboardRow
	for rows.Next() {
		var data models.LeaderboardRow
		if err := rows.Scan(&data.UserId, &data.Username, &data.Value); err == nil {
			data.Type = category
			data.Rank = rank
			rank++

			leaderboard = append(leaderboard, data)
		}
	}
	return leaderboard
}

func getBestRank(db *sql.DB, category uint, userId, condition string) []models.LeaderboardRow {
	column := "score"
	if category == models.KILL {
		column = "kills"
	}

	query := `with ranked_ph as (
			select user_id, ` + column + ` as value,
			rank() over (order by value desc) as rank
			from play_history
			where ` + condition + `
		)
			select rank
			from ranked_ph
			where user_id = $1
			order by rank
			limit 1`

	var rank int
	err := db.QueryRow(query, userId).Scan(&rank)
	if err != nil {
		return []models.LeaderboardRow{}
	}

	return []models.LeaderboardRow{{UserId: userId, Rank: rank, Type: category}}
}

func getLeaderboard(c *gin.Context, period uint) {
	condition := timeFrames[period]
	db := database.GetDatabase()
	userId := c.Param("id")

	// get & verify page number
	page, err := strconv.Atoi(c.DefaultQuery("page", "0"))
	if err != nil || page < 0 {
		page = 0
	}

	offset := page * LIMIT
	leaderboard := map[string][]models.LeaderboardRow{
		"score":      fetchLeaderboard(db, models.SCORE, condition, LIMIT, offset),
		"kills":      fetchLeaderboard(db, models.KILL, condition, LIMIT, offset),
		"best_score": getBestRank(db, models.SCORE, userId, condition),
		"best_kill":  getBestRank(db, models.KILL, userId, condition),
	}

	c.JSON(http.StatusOK, leaderboard)
}

func LeaderboardAllHandler(c *gin.Context)   { getLeaderboard(c, ALL) }
func LeaderboardDayHandler(c *gin.Context)   { getLeaderboard(c, DAY) }
func LeaderboardWeekHandler(c *gin.Context)  { getLeaderboard(c, WEEK) }
func LeaderboardMonthHandler(c *gin.Context) { getLeaderboard(c, MONTH) }

func MatchHistoryHandler(c *gin.Context) {
	db := database.GetDatabase()
	userId := c.Param("id")

	// get & verify page number
	page, err := strconv.Atoi(c.DefaultQuery("page", "0"))
	if err != nil || page < 0 {
		page = 0
	}

	query := `select score, ship_model, kills, time_alive, created_at
		from play_history
		where user_id = $1
		order by created_at desc
		limit $2 offset $3`

	offset := page * LIMIT
	rows, err := db.Query(query, userId, LIMIT, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch match history"})
		return
	}

	defer rows.Close()
	var history []models.GameHistory
	for rows.Next() {
		var game models.GameHistory
		if err := rows.Scan(&game.Score, &game.ShipModel, &game.Kills, &game.TimeAlive, &game.CreatedAt); err == nil {
			history = append(history, game)
		}
	}

	if len(history) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No game history found"})
	}

	c.JSON(http.StatusOK, history)
}

func formatTime(sec float64) string {
	hours := int(sec) / 3600
	minutes := (int(sec) % 3600) / 60
	seconds := int(sec) % 60
	return fmt.Sprintf("%02d:%02d:%02d", hours, minutes, seconds)
}

func StatsHandler(c *gin.Context) {
	db := database.GetDatabase()
	userId := c.Param("id")

	query := `select
			sum(score) as total_score,
			sum(kills) as total_kills,
			count(*) as total_games_played, 
			sum(extract(epoch from time_alive)) as total_time_alive_seconds
		from play_history
		where user_id = $1`

	var stats models.UserStats
	var totalTimeAlive float64
	err := db.QueryRow(query, userId).Scan(&stats.TotalScore, &stats.TotalKills, &stats.TotalGamesPlayed, &totalTimeAlive)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user stats"})
		return
	}

	stats.KDA = 0
	if stats.TotalGamesPlayed > 0 {
		stats.KDA = float64(stats.TotalKills) / float64(stats.TotalGamesPlayed)
	}

	stats.TotalTimeAlive = formatTime(totalTimeAlive)
	c.JSON(http.StatusOK, stats)
}
