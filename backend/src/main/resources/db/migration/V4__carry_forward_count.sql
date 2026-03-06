-- V4__carry_forward_count.sql
-- Track how many times an item has been carried forward

ALTER TABLE commit_item ADD COLUMN carry_forward_count INT NOT NULL DEFAULT 0;
ALTER TABLE commit_item ADD COLUMN flagged_stale BOOLEAN NOT NULL DEFAULT false;
