-- Simplification de be_activity : on ne garde que l'essentiel.
-- Les colonnes supprimées (source_hash, polyline, stats) ne sont plus nécessaires.
-- strava_activity_id identifie l'activité via le CSV de l'archive Strava.

ALTER TABLE be_activity DROP COLUMN IF EXISTS source_hash;
ALTER TABLE be_activity DROP COLUMN IF EXISTS file_name;
ALTER TABLE be_activity DROP COLUMN IF EXISTS activity_type;
ALTER TABLE be_activity DROP COLUMN IF EXISTS distance;
ALTER TABLE be_activity DROP COLUMN IF EXISTS moving_time;
ALTER TABLE be_activity DROP COLUMN IF EXISTS total_elevation_gain;
ALTER TABLE be_activity DROP COLUMN IF EXISTS summary_polyline;
ALTER TABLE be_activity DROP COLUMN IF EXISTS average_speed;
ALTER TABLE be_activity DROP COLUMN IF EXISTS max_speed;
ALTER TABLE be_activity DROP COLUMN IF EXISTS strava_id;

ALTER TABLE be_activity ADD COLUMN strava_activity_id BIGINT NOT NULL DEFAULT 0;
ALTER TABLE be_activity ADD CONSTRAINT uq_be_activity_user_strava
    UNIQUE (user_id, strava_activity_id);
