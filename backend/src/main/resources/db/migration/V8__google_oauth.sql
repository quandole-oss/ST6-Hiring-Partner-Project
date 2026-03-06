-- V8__google_oauth.sql
-- Add Google OAuth support to team_member

ALTER TABLE team_member ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE team_member ADD COLUMN avatar_url VARCHAR(512);

-- Allow password_hash to be null for OAuth-only users
-- (already nullable from V7)
