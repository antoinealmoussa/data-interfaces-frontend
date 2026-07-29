-- Empêcher les doublons de cols lors des imports successifs.
ALTER TABLE be_col ADD CONSTRAINT uq_be_col_osm_id UNIQUE (osm_id);
