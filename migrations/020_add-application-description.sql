BEGIN;

ALTER TABLE application ADD COLUMN description TEXT;

UPDATE application SET description = 'Découvre tous les cols que tu as parcouru à vélo' WHERE name = 'bike-exploration';
UPDATE application SET description = 'Gère ton équipe de rugby' WHERE name = 'rugby-teams';
UPDATE application SET description = 'Prépare ton prochain trail' WHERE name = 'race-preparation';

ALTER TABLE application ALTER COLUMN description SET NOT NULL;

COMMIT;
