-- Ajouter CASCADE sur team_season.team_id
ALTER TABLE team_season
DROP CONSTRAINT team_season_team_id_fkey,
ADD CONSTRAINT team_season_team_id_fkey
    FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE;

-- Ajouter CASCADE sur team_season.season_id
ALTER TABLE team_season
DROP CONSTRAINT team_season_season_id_fkey,
ADD CONSTRAINT team_season_season_id_fkey
    FOREIGN KEY (season_id) REFERENCES season(id) ON DELETE CASCADE;
