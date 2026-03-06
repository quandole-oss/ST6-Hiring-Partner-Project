-- V5__item_risk_flag.sql
-- Per-item BLOCKED / AT_RISK flags

ALTER TABLE commit_item ADD COLUMN risk_flag VARCHAR(20)
    CHECK (risk_flag IN ('BLOCKED', 'AT_RISK'));
ALTER TABLE commit_item ADD COLUMN risk_note TEXT;
ALTER TABLE commit_item ADD COLUMN risk_flagged_at TIMESTAMP;
