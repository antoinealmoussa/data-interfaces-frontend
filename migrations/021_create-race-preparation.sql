BEGIN;

CREATE TABLE rp_race (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user_stravoska(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    gpx_file_path VARCHAR(512) NOT NULL,
    total_distance DOUBLE PRECISION NOT NULL,
    total_elevation_gain DOUBLE PRECISION NOT NULL,
    total_elevation_loss DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_rp_race_user_id ON rp_race(user_id);

CREATE TABLE rp_section (
    id SERIAL PRIMARY KEY,
    race_id INTEGER NOT NULL REFERENCES rp_race(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    name VARCHAR(255),
    section_type VARCHAR(15) NOT NULL,
    start_distance DOUBLE PRECISION NOT NULL,
    end_distance DOUBLE PRECISION NOT NULL,
    distance DOUBLE PRECISION NOT NULL,
    elevation_gain DOUBLE PRECISION NOT NULL,
    elevation_loss DOUBLE PRECISION NOT NULL,
    average_gradient DOUBLE PRECISION NOT NULL,
    start_elevation DOUBLE PRECISION NOT NULL,
    end_elevation DOUBLE PRECISION NOT NULL,
    pace DOUBLE PRECISION,
    actual_pace DOUBLE PRECISION
);
CREATE INDEX ix_rp_section_race_id ON rp_section(race_id);

CREATE TABLE rp_track_point (
    id SERIAL PRIMARY KEY,
    race_id INTEGER NOT NULL REFERENCES rp_race(id) ON DELETE CASCADE,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    elevation DOUBLE PRECISION NOT NULL,
    distance DOUBLE PRECISION NOT NULL,
    point_index INTEGER NOT NULL
);
CREATE INDEX ix_rp_track_point_race_id ON rp_track_point(race_id);

COMMIT;
