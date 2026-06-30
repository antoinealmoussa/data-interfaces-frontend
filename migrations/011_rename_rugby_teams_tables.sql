BEGIN;

ALTER TABLE team              RENAME TO rt_team;
ALTER TABLE season            RENAME TO rt_season;
ALTER TABLE category          RENAME TO rt_category;
ALTER TABLE player            RENAME TO rt_player;
ALTER TABLE tournament        RENAME TO rt_tournament;

ALTER TABLE team_season       RENAME TO rt_team_season;
ALTER TABLE team_category     RENAME TO rt_team_category;
ALTER TABLE player_category   RENAME TO rt_player_category;
ALTER TABLE tournament_player RENAME TO rt_tournament_player;

COMMIT;
