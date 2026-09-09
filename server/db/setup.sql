-- One-time database bootstrap. Run as a PostgreSQL superuser:
--   psql -d postgres -f db/setup.sql
--
-- Replace CHANGE_ME with your own password, then put the same value in the
-- DATABASE_URL of server/.env. Afterwards run: npm run migrate

CREATE ROLE authenticator WITH LOGIN PASSWORD 'CHANGE_ME';
CREATE DATABASE authenticator_db OWNER authenticator;
