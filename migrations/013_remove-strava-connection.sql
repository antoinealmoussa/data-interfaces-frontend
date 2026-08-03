BEGIN;

-- Supprimer la table Strava (obsolète, remplacé par upload GPX)
DROP TABLE IF EXISTS be_strava_connection;

-- Rendre strava_id nullable + supprimer l'unicité
ALTER TABLE be_activity DROP CONSTRAINT IF EXISTS be_activity_strava_id_key;
ALTER TABLE be_activity ALTER COLUMN strava_id DROP NOT NULL;

-- Ajouter colonnes pour le suivi des fichiers uploadés
ALTER TABLE be_activity ADD COLUMN source_hash VARCHAR(64) NOT NULL;
ALTER TABLE be_activity ADD COLUMN file_name VARCHAR(255);
CREATE UNIQUE INDEX ix_be_activity_source_hash ON be_activity(source_hash);

COMMIT;
