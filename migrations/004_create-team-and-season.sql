CREATE TABLE season (
    id SERIAL PRIMARY KEY,
    name VARCHAR(9) NOT NULL UNIQUE
);

CREATE TABLE team (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    categories TEXT[] NOT NULL,
    user_id INTEGER REFERENCES user_stravoska(id)
);

CREATE TABLE team_season (
    team_id INTEGER REFERENCES team(id),
    season_id INTEGER REFERENCES season(id),
    PRIMARY KEY (team_id, season_id)
);
