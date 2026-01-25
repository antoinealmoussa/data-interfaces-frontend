BEGIN;

CREATE TABLE user_stravoska (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    surname TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL
);

CREATE UNIQUE INDEX ix_user_stravoska_email ON user_stravoska (email);

CREATE INDEX ix_user_stravoska_id ON user_stravoska (id);

INSERT INTO
    schema_migrations (version)
VALUES
    ('001');

COMMIT;