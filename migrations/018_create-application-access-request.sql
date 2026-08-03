BEGIN;

CREATE TABLE application_access_request (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user_stravoska(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    decided_by INTEGER REFERENCES user_stravoska(id),
    decided_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX ix_application_access_request_id ON application_access_request (id);
CREATE INDEX ix_application_access_request_user_id ON application_access_request (user_id);

CREATE TABLE application_access_request_application (
    request_id INTEGER NOT NULL REFERENCES application_access_request(id) ON DELETE CASCADE,
    application_id INTEGER NOT NULL REFERENCES application(id) ON DELETE CASCADE,
    PRIMARY KEY (request_id, application_id)
);

COMMIT;
