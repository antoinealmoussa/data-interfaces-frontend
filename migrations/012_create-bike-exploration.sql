BEGIN;

-- Strava connection
CREATE TABLE be_strava_connection (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user_stravoska(id) ON DELETE CASCADE,
    strava_athlete_id BIGINT,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    last_sync_at TIMESTAMP,
    sync_status TEXT NOT NULL DEFAULT 'idle',
    sync_error TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Activities
CREATE TABLE be_activity (
    id SERIAL PRIMARY KEY,
    strava_id BIGINT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES user_stravoska(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    distance DOUBLE PRECISION,
    moving_time INTEGER,
    total_elevation_gain DOUBLE PRECISION,
    summary_polyline TEXT,
    average_speed DOUBLE PRECISION,
    max_speed DOUBLE PRECISION,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(strava_id)
);
CREATE INDEX ix_be_activity_user_id ON be_activity(user_id);

-- Cols
CREATE TABLE be_col (
    id SERIAL PRIMARY KEY,
    osm_id BIGINT,
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    elevation INTEGER,
    country TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Activity-Col association
CREATE TABLE be_activity_col (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER NOT NULL REFERENCES be_activity(id) ON DELETE CASCADE,
    col_id INTEGER NOT NULL REFERENCES be_col(id) ON DELETE CASCADE,
    matched_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(activity_id, col_id)
);
CREATE INDEX ix_be_activity_col_activity_id ON be_activity_col(activity_id);
CREATE INDEX ix_be_activity_col_col_id ON be_activity_col(col_id);

COMMIT;
