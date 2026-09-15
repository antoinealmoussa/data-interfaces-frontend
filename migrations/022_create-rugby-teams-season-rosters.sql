BEGIN;

-- 1. Table d'appartenance joueur / équipe / saison (roster saisonnier)
CREATE TABLE rt_player_team_season (
    player_id INTEGER NOT NULL REFERENCES rt_player(id) ON DELETE CASCADE,
    team_id   INTEGER NOT NULL REFERENCES rt_team(id)   ON DELETE CASCADE,
    season_id INTEGER NOT NULL REFERENCES rt_season(id) ON DELETE CASCADE,
    PRIMARY KEY (player_id, team_id, season_id)
);
CREATE INDEX ix_player_team_season_team_season
    ON rt_player_team_season(team_id, season_id);

-- 2. Backfill : chaque joueur existant est affecté à toutes les saisons de son équipe
INSERT INTO rt_player_team_season (player_id, team_id, season_id)
SELECT p.id, t.id, ts.season_id
FROM rt_player p
JOIN rt_team t        ON t.id = p.team_id
JOIN rt_team_season ts ON ts.team_id = t.id;

-- 3. Saisonnalisation des tournois : saison la plus récente de l'équipe
ALTER TABLE rt_tournament ADD COLUMN season_id INTEGER
    REFERENCES rt_season(id) ON DELETE CASCADE;

UPDATE rt_tournament
SET season_id = backfill.season_id
FROM (
    SELECT t.id AS tournament_id, ranked.season_id
    FROM rt_tournament t
    JOIN (
        SELECT ts.team_id, ts.season_id,
               ROW_NUMBER() OVER (PARTITION BY ts.team_id ORDER BY season.name DESC) AS rn
        FROM rt_team_season ts
        JOIN rt_season season ON season.id = ts.season_id
    ) ranked ON ranked.team_id = t.team_id AND ranked.rn = 1
) backfill
WHERE backfill.tournament_id = rt_tournament.id
  AND rt_tournament.season_id IS NULL;

ALTER TABLE rt_tournament ALTER COLUMN season_id SET NOT NULL;
CREATE INDEX ix_tournament_season_id ON rt_tournament(season_id);

-- 4. Fin de l'appartenance unique joueur -> équipe
ALTER TABLE rt_player DROP COLUMN team_id;
DROP INDEX IF EXISTS ix_player_team_id;

COMMIT;