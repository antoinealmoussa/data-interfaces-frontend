BEGIN;

CREATE TABLE application (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    pretty_name TEXT NOT NULL
);

CREATE INDEX ix_application_id ON application (id);

CREATE TABLE user_application (
    user_id INTEGER NOT NULL,
    application_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, application_id),
    FOREIGN KEY (user_id) REFERENCES user_stravoska(id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES application(id) ON DELETE CASCADE
);

INSERT INTO
    application (name, pretty_name)
VALUES
    ('bike-exploration', 'Exploration vélo'),
    ('rugby-teams', 'Rugby teams'),
    ('race-preparation', 'Préparation de course');

INSERT INTO
    user_application (user_id, application_id)
VALUES
    (3, 1),
    (3, 2),
    (3, 3);

INSERT INTO
    schema_migrations (version)
VALUES
    ('002');

COMMIT;