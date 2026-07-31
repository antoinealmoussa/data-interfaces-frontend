BEGIN;

ALTER TABLE be_activity_col
  ADD COLUMN crossings INTEGER NOT NULL DEFAULT 1;

COMMENT ON COLUMN be_activity_col.crossings IS
  'Nombre de fois que le col a été traversé pendant cette activité. Une traversée = entrée dans le rayon de 200m après en être sorti.';

COMMIT;
