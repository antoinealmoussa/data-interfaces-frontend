CREATE TABLE player (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 4),
    sex VARCHAR(1) NOT NULL CHECK (sex IN ('H', 'F')),
    position VARCHAR(10) NOT NULL CHECK (position IN ('Ailier', 'Meneur')),
    category_id INTEGER NOT NULL REFERENCES category(id) ON DELETE RESTRICT,
    team_id INTEGER NOT NULL REFERENCES team(id) ON DELETE CASCADE
);

CREATE INDEX ix_player_team_id ON player(team_id);
