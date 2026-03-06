-- V6__audit_log.sql
-- Audit logging for state machine transitions

CREATE TABLE audit_log (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_commit_id  UUID NOT NULL REFERENCES weekly_commit(id) ON DELETE CASCADE,
    previous_state    commit_status NOT NULL,
    new_state         commit_status NOT NULL,
    triggered_by      VARCHAR(255) NOT NULL DEFAULT 'ANONYMOUS',
    is_manual_override BOOLEAN NOT NULL DEFAULT false,
    notes             TEXT,
    created_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_commit ON audit_log(weekly_commit_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);
