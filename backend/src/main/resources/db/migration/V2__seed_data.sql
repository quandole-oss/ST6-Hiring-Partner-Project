-- V2__seed_data.sql
-- Sample RCDO hierarchy and demo team

-- Rally Cries
INSERT INTO rally_cry (id, title, description) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Accelerate Product-Led Growth', 'Drive adoption through product experience and self-serve onboarding.'),
    ('a0000000-0000-0000-0000-000000000002', 'Build World-Class Engineering Culture', 'Attract, retain, and develop top engineering talent.');

-- Defining Objectives
INSERT INTO defining_objective (id, rally_cry_id, title, description) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Improve Onboarding Conversion', 'Increase trial-to-paid conversion rate by 20%.'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Reduce Time to Value', 'Decrease median time-to-first-value from 3 days to 1 day.'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Ship Faster with Quality', 'Maintain <1% rollback rate while increasing deploy frequency.'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'Strengthen Knowledge Sharing', 'Establish weekly tech talks and internal documentation standards.');

-- Outcomes
INSERT INTO outcome (id, defining_objective_id, title, description) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Guided setup wizard live', 'Ship interactive setup wizard for new users.'),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Email drip campaign active', 'Deploy 5-step onboarding email sequence.'),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'Sample project auto-created', 'Auto-generate a sample project on sign-up.'),
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'CI pipeline under 10 min', 'Optimize CI to complete full suite in under 10 minutes.'),
    ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'Feature flag framework', 'Implement feature flag system for safe rollouts.'),
    ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000004', 'Weekly tech talk schedule', 'Establish rotating tech talk schedule with 80% participation.'),
    ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000004', 'Internal wiki v1', 'Launch searchable internal engineering wiki.');

-- Team
INSERT INTO team (id, name) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'Platform Squad');

-- Team Members
INSERT INTO team_member (id, team_id, name, email, role) VALUES
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Alice Chen', 'alice@example.com', 'LEAD'),
    ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Bob Martinez', 'bob@example.com', 'MEMBER'),
    ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'Carol Johnson', 'carol@example.com', 'MEMBER');

-- Sample weekly commit for Alice (current week)
INSERT INTO weekly_commit (id, team_member_id, week_start, status) VALUES
    ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', date_trunc('week', CURRENT_DATE)::date, 'DRAFT');

-- Sample commit items
INSERT INTO commit_item (id, weekly_commit_id, outcome_id, title, description, chess_category, effort_estimate, impact_estimate, sort_order) VALUES
    ('10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Design wizard wireframes', 'Create low-fi wireframes for the 4-step setup wizard.', 'STRATEGIC', 3, 5, 1),
    ('10000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Fix flaky integration tests', 'Investigate and fix 3 flaky tests in the CI suite.', 'OPERATIONAL', 2, 3, 2),
    ('10000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', NULL, 'Team standup prep', 'Prepare weekly standup notes and blockers list.', 'MAINTENANCE', 1, 2, 3);
