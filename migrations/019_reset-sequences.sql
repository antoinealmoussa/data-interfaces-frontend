BEGIN;

SELECT setval('user_stravoska_id_seq', GREATEST(COALESCE((SELECT MAX(id) FROM user_stravoska), 0), 1));
SELECT setval('application_id_seq', GREATEST(COALESCE((SELECT MAX(id) FROM application), 0), 1));
SELECT setval('role_id_seq', GREATEST(COALESCE((SELECT MAX(id) FROM role), 0), 1));

COMMIT;
