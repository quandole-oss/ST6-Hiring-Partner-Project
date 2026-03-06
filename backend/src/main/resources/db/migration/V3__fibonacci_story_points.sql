-- V3__fibonacci_story_points.sql
-- Change effort_estimate to Fibonacci scale (1,2,3,5,8,13) and rename actual_effort

-- Drop old effort_estimate CHECK constraint
DO $$ BEGIN
  EXECUTE (SELECT 'ALTER TABLE commit_item DROP CONSTRAINT ' || conname
           FROM pg_constraint WHERE conrelid = 'commit_item'::regclass
           AND pg_get_constraintdef(oid) LIKE '%effort_estimate%');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Map non-Fibonacci values to nearest Fibonacci (4 -> 5 is the only case in the 1-5 range)
UPDATE commit_item SET effort_estimate = 5 WHERE effort_estimate = 4;

ALTER TABLE commit_item ADD CONSTRAINT commit_item_effort_fibonacci
    CHECK (effort_estimate IN (1, 2, 3, 5, 8, 13));

-- Drop old impact_estimate CHECK constraint to allow values beyond 5
DO $$ BEGIN
  EXECUTE (SELECT 'ALTER TABLE commit_item DROP CONSTRAINT ' || conname
           FROM pg_constraint WHERE conrelid = 'commit_item'::regclass
           AND pg_get_constraintdef(oid) LIKE '%impact_estimate%');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Rename actual_effort -> actual_story_points in reconciliation
DO $$ BEGIN
  EXECUTE (SELECT 'ALTER TABLE reconciliation DROP CONSTRAINT ' || conname
           FROM pg_constraint WHERE conrelid = 'reconciliation'::regclass
           AND pg_get_constraintdef(oid) LIKE '%actual_effort%' LIMIT 1);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Map non-Fibonacci values in reconciliation before rename
UPDATE reconciliation SET actual_effort = 5 WHERE actual_effort = 4;

ALTER TABLE reconciliation RENAME COLUMN actual_effort TO actual_story_points;
ALTER TABLE reconciliation ADD CONSTRAINT reconciliation_story_points_fibonacci
    CHECK (actual_story_points IN (1, 2, 3, 5, 8, 13));
