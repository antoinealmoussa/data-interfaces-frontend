BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_stravoska (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    surname TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL
);

INSERT INTO 
    user_stravoska (id, first_name, surname, email, password)
VALUES
    (1, 'Antoine', 'Almoussa', 'antoinealmoussa@gmail.com', '$2b$12$4Wq/iKBofBP4YHHiOkh8H.QJMXonE2MO7gp5WMPDT63AGNlGlRyoW');
    
CREATE UNIQUE INDEX ix_user_stravoska_email ON user_stravoska (email);

CREATE INDEX ix_user_stravoska_id ON user_stravoska (id);

COMMIT;