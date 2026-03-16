-- Runs once on first container startup (empty volume)
-- Re-running docker compose up will NOT re-run this

CREATE TABLE IF NOT EXISTS users (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);
