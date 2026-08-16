BEGIN;

CREATE TABLE IF NOT EXISTS role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO role (id, name) VALUES
    (1, 'admin'),
    (2, 'normal_user');

ALTER TABLE user_stravoska
    ADD COLUMN role_id INTEGER REFERENCES role(id);

-- Antoine (migration 001) devient admin
UPDATE user_stravoska SET role_id = 1 WHERE email = 'antoinealmoussa@gmail.com';

-- Tous les autres utilisateurs existants → normal_user
UPDATE user_stravoska SET role_id = 2 WHERE role_id IS NULL;

ALTER TABLE user_stravoska ALTER COLUMN role_id SET NOT NULL;

CREATE INDEX ix_user_stravoska_role_id ON user_stravoska (role_id);

COMMIT;
