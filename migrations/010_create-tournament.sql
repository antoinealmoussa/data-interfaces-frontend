CREATE TABLE tournament (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES category(id) ON DELETE RESTRICT,
    team_id INTEGER NOT NULL REFERENCES team(id) ON DELETE CASCADE
);

CREATE INDEX ix_tournament_team_id ON tournament(team_id);

CREATE TABLE tournament_player (
    tournament_id INTEGER NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES player(id) ON DELETE CASCADE,
    PRIMARY KEY (tournament_id, player_id)
);
