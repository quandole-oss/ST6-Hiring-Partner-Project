-- V7__auth_and_audit_enhancements.sql
-- Auth: add password hash to team_member
-- Audit: add item-level tracking columns

-- Auth: add password hash column
ALTER TABLE team_member ADD COLUMN password_hash VARCHAR(255);

-- Seed bcrypt hash for 'password123' for existing demo members
UPDATE team_member SET password_hash = '$2b$10$91IRkZ4AWJgHVM5fLh7OO.1OYSiiFXVeYvdYps8LAn9Ja9W2G7Kti' WHERE password_hash IS NULL;

-- Audit: make state columns nullable (item-level changes have no state)
ALTER TABLE audit_log ALTER COLUMN previous_state DROP NOT NULL;
ALTER TABLE audit_log ALTER COLUMN new_state DROP NOT NULL;

-- Audit: add item-level tracking columns
ALTER TABLE audit_log ADD COLUMN commit_item_id UUID REFERENCES commit_item(id) ON DELETE SET NULL;
ALTER TABLE audit_log ADD COLUMN action_type VARCHAR(50) NOT NULL DEFAULT 'STATE_TRANSITION';
ALTER TABLE audit_log ADD COLUMN old_value VARCHAR(255);
ALTER TABLE audit_log ADD COLUMN new_value VARCHAR(255);

CREATE INDEX idx_audit_log_item ON audit_log(commit_item_id);
