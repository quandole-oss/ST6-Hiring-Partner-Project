-- V10__refresh_seed_current_week.sql
-- Refresh seed data so the dashboard shows commits for the current week.
-- The original V2 seed used CURRENT_DATE at migration time, which is now stale.

-- Compute current ISO week Monday (matches Java: LocalDate.now().with(previousOrSame(MONDAY)))
-- ISODOW: Monday=1 ... Sunday=7, so CURRENT_DATE - (ISODOW-1) gives Monday.

-- ============================================================
-- 1. Delete stale seed commit items and weekly commits (by known V2 UUIDs)
-- ============================================================
DELETE FROM commit_item WHERE id IN (
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000003'
);

DELETE FROM weekly_commit WHERE id = 'f0000000-0000-0000-0000-000000000001';

-- ============================================================
-- 2. Re-insert Alice's weekly commit for the current week
-- ============================================================
INSERT INTO weekly_commit (id, team_member_id, week_start, status) VALUES
    ('f0000000-0000-0000-0000-000000000001',
     'e0000000-0000-0000-0000-000000000001',
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     'DRAFT');

-- Re-insert Alice's 3 commit items
INSERT INTO commit_item (id, weekly_commit_id, outcome_id, title, description, chess_category, effort_estimate, impact_estimate, sort_order) VALUES
    ('10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Design wizard wireframes', 'Create low-fi wireframes for the 4-step setup wizard.', 'STRATEGIC', 3, 5, 1),
    ('10000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Fix flaky integration tests', 'Investigate and fix 3 flaky tests in the CI suite.', 'OPERATIONAL', 2, 3, 2),
    ('10000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', NULL, 'Team standup prep', 'Prepare weekly standup notes and blockers list.', 'MAINTENANCE', 1, 2, 3);

-- ============================================================
-- 3. Create weekly commit + items for Bob
-- ============================================================
INSERT INTO weekly_commit (id, team_member_id, week_start, status) VALUES
    ('f0000000-0000-0000-0000-000000000002',
     'e0000000-0000-0000-0000-000000000002',
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     'DRAFT');

INSERT INTO commit_item (id, weekly_commit_id, outcome_id, title, description, chess_category, effort_estimate, impact_estimate, sort_order) VALUES
    ('10000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005', 'Implement feature flag SDK', 'Build client-side SDK for feature flag evaluation.', 'STRATEGIC', 5, 5, 1),
    ('10000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004', 'Parallelize test stages', 'Split CI into parallel test stages to reduce wall time.', 'TACTICAL', 3, 3, 2),
    ('10000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000002', NULL, 'Dependency upgrades', 'Update Spring Boot and frontend deps to latest patch.', 'MAINTENANCE', 2, 2, 3);

-- ============================================================
-- 4. Create weekly commit + items for Carol
-- ============================================================
INSERT INTO weekly_commit (id, team_member_id, week_start, status) VALUES
    ('f0000000-0000-0000-0000-000000000003',
     'e0000000-0000-0000-0000-000000000003',
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     'DRAFT');

INSERT INTO commit_item (id, weekly_commit_id, outcome_id, title, description, chess_category, effort_estimate, impact_estimate, sort_order) VALUES
    ('10000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'Draft onboarding email copy', 'Write copy for the 5-step welcome email sequence.', 'STRATEGIC', 3, 5, 1),
    ('10000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Sample project generator', 'Build service to auto-generate a demo project on sign-up.', 'TACTICAL', 5, 3, 2),
    ('10000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000003', NULL, 'Update API docs', 'Refresh OpenAPI spec for new endpoints.', 'OPERATIONAL', 2, 2, 3);

-- ============================================================
-- 5. Add real user (Quan Le) to Platform Squad
-- ============================================================
INSERT INTO team_member (id, team_id, name, email, role) VALUES
    ('e0000000-0000-0000-0000-000000000004',
     'd0000000-0000-0000-0000-000000000001',
     'Quan Le',
     'quan.le@challenger.gauntletai.com',
     'LEAD')
ON CONFLICT (email) DO NOTHING;

-- Create weekly commit + items for Quan
INSERT INTO weekly_commit (id, team_member_id, week_start, status) VALUES
    ('f0000000-0000-0000-0000-000000000004',
     (SELECT id FROM team_member WHERE email = 'quan.le@challenger.gauntletai.com'),
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     'DRAFT');

INSERT INTO commit_item (id, weekly_commit_id, outcome_id, title, description, chess_category, effort_estimate, impact_estimate, sort_order) VALUES
    ('10000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Review wizard UX flow', 'Review and approve the setup wizard wireframes and UX flow.', 'STRATEGIC', 2, 5, 1),
    ('10000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000006', 'Kick off tech talk series', 'Schedule first 4 tech talks and send invites to eng team.', 'TACTICAL', 3, 3, 2),
    ('10000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000004', NULL, 'Sprint planning', 'Prepare and run sprint planning for the upcoming week.', 'OPERATIONAL', 2, 2, 3);
