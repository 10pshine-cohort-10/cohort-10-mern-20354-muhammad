-- Runs automatically on first container start (/docker-entrypoint-initdb.d).
-- Creates both application databases; guarded so re-running is harmless.
SELECT 'CREATE DATABASE notes_dev'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'notes_dev')
\gexec

SELECT 'CREATE DATABASE notes_test'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'notes_test')
\gexec
