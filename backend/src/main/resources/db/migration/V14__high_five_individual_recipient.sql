-- Allow high fives to individual team members (not just teams)
ALTER TABLE high_five ADD COLUMN receiver_member_id UUID REFERENCES team_member(id) ON DELETE CASCADE;

CREATE INDEX idx_high_five_receiver_member ON high_five(receiver_member_id);

-- Drop old unique constraint (team-only)
ALTER TABLE high_five DROP CONSTRAINT high_five_giver_id_receiver_team_id_week_start_key;

-- Team-level high fives: one per giver/team/week
CREATE UNIQUE INDEX uq_high_five_team ON high_five(giver_id, receiver_team_id, week_start) WHERE receiver_member_id IS NULL;

-- Individual high fives: one per giver/member/week
CREATE UNIQUE INDEX uq_high_five_member ON high_five(giver_id, receiver_member_id, week_start) WHERE receiver_member_id IS NOT NULL;
