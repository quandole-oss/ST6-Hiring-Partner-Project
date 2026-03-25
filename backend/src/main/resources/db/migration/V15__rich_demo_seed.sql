-- V15__rich_demo_seed.sql
-- Populate dashboard with rich, realistic demo data for a live walkthrough.
-- All weekly commits use CURRENT_DATE to target the current ISO week.
-- Uses email lookups for team members to handle Google OAuth UUIDs.

-- Helper: current Monday
-- ISODOW: Monday=1..Sunday=7, so Monday = CURRENT_DATE - (ISODOW - 1)

-- ============================================================
-- 0. Clean up ALL existing commit data for seed team members (by email)
-- ============================================================
DELETE FROM reconciliation WHERE commit_item_id IN (
    SELECT ci.id FROM commit_item ci
    JOIN weekly_commit wc ON ci.weekly_commit_id = wc.id
    WHERE wc.team_member_id IN (
        SELECT id FROM team_member WHERE email IN (
            'alice@example.com', 'bob@example.com',
            'carol@example.com', 'quan.le@challenger.gauntletai.com'
        )
    )
);

DELETE FROM commit_item WHERE weekly_commit_id IN (
    SELECT wc.id FROM weekly_commit wc
    WHERE wc.team_member_id IN (
        SELECT id FROM team_member WHERE email IN (
            'alice@example.com', 'bob@example.com',
            'carol@example.com', 'quan.le@challenger.gauntletai.com'
        )
    )
);

DELETE FROM weekly_commit WHERE team_member_id IN (
    SELECT id FROM team_member WHERE email IN (
        'alice@example.com', 'bob@example.com',
        'carol@example.com', 'quan.le@challenger.gauntletai.com'
    )
);

DELETE FROM high_five WHERE giver_id IN (
    SELECT id FROM team_member WHERE email IN (
        'alice@example.com', 'bob@example.com',
        'carol@example.com', 'quan.le@challenger.gauntletai.com'
    )
);

DELETE FROM retrospective_entry WHERE team_member_id IN (
    SELECT id FROM team_member WHERE email IN (
        'alice@example.com', 'bob@example.com',
        'carol@example.com', 'quan.le@challenger.gauntletai.com'
    )
);

-- ============================================================
-- 1. PREVIOUS WEEK data (for mood trend comparison)
-- ============================================================

-- Alice - previous week (RECONCILED)
INSERT INTO weekly_commit (id, team_member_id, week_start, status, mood_score, locked_at, reconciled_at) VALUES
    ('f1000000-0000-0000-0000-000000000001',
     (SELECT id FROM team_member WHERE email = 'alice@example.com'),
     (CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1)) - 7,
     'RECONCILED', 3,
     (CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1)) - 5,
     (CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1)) - 1);

-- Bob - previous week (RECONCILED)
INSERT INTO weekly_commit (id, team_member_id, week_start, status, mood_score, locked_at, reconciled_at) VALUES
    ('f1000000-0000-0000-0000-000000000002',
     (SELECT id FROM team_member WHERE email = 'bob@example.com'),
     (CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1)) - 7,
     'RECONCILED', 4,
     (CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1)) - 5,
     (CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1)) - 1);

-- Carol - previous week (RECONCILED)
INSERT INTO weekly_commit (id, team_member_id, week_start, status, mood_score, locked_at, reconciled_at) VALUES
    ('f1000000-0000-0000-0000-000000000003',
     (SELECT id FROM team_member WHERE email = 'carol@example.com'),
     (CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1)) - 7,
     'RECONCILED', 5,
     (CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1)) - 5,
     (CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1)) - 1);

-- Quan - previous week (RECONCILED)
INSERT INTO weekly_commit (id, team_member_id, week_start, status, mood_score, locked_at, reconciled_at) VALUES
    ('f1000000-0000-0000-0000-000000000004',
     (SELECT id FROM team_member WHERE email = 'quan.le@challenger.gauntletai.com'),
     (CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1)) - 7,
     'RECONCILED', 3,
     (CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1)) - 5,
     (CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1)) - 1);

-- Previous week items (minimal - just enough for mood trend)
INSERT INTO commit_item (id, weekly_commit_id, outcome_id, title, chess_category, effort_estimate, impact_estimate, sort_order) VALUES
    ('11000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Wizard prototype v1', 'STRATEGIC', 5, 5, 1),
    ('11000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'CI pipeline audit', 'OPERATIONAL', 3, 3, 2),
    ('11000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005', 'Feature flag design doc', 'STRATEGIC', 3, 5, 1),
    ('11000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000002', NULL, 'On-call rotation', 'MAINTENANCE', 2, 2, 2),
    ('11000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'Email template research', 'TACTICAL', 3, 3, 1),
    ('11000000-0000-0000-0000-000000000006', 'f1000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Sign-up flow analysis', 'STRATEGIC', 2, 5, 2),
    ('11000000-0000-0000-0000-000000000007', 'f1000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000006', 'Tech talk pilot session', 'TACTICAL', 3, 3, 1),
    ('11000000-0000-0000-0000-000000000008', 'f1000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000007', 'Wiki platform eval', 'STRATEGIC', 5, 5, 2);

-- Reconciliations for previous week
INSERT INTO reconciliation (id, commit_item_id, completion_status, actual_story_points, notes) VALUES
    ('20000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'COMPLETED', 5, 'Prototype delivered and demoed.'),
    ('20000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000002', 'COMPLETED', 3, 'Audit complete, 12 bottlenecks identified.'),
    ('20000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000003', 'COMPLETED', 3, 'Design doc approved by team.'),
    ('20000000-0000-0000-0000-000000000004', '11000000-0000-0000-0000-000000000004', 'COMPLETED', 2, 'Rotation set up for Q2.'),
    ('20000000-0000-0000-0000-000000000005', '11000000-0000-0000-0000-000000000005', 'COMPLETED', 3, 'Research complete, 3 template services shortlisted.'),
    ('20000000-0000-0000-0000-000000000006', '11000000-0000-0000-0000-000000000006', 'PARTIAL', 2, 'Analysis started but needs more data from analytics.'),
    ('20000000-0000-0000-0000-000000000007', '11000000-0000-0000-0000-000000000007', 'COMPLETED', 3, 'First tech talk delivered — 85% attendance.'),
    ('20000000-0000-0000-0000-000000000008', '11000000-0000-0000-0000-000000000008', 'COMPLETED', 5, 'Confluence selected, pilot space created.');


-- ============================================================
-- 2. CURRENT WEEK — Alice Chen (LOCKED, high performer)
--    5 items, 4 completed, mood=4 (up from 3), alignment=80%
-- ============================================================
INSERT INTO weekly_commit (id, team_member_id, week_start, status, mood_score, locked_at) VALUES
    ('f0000000-0000-0000-0000-000000000001',
     (SELECT id FROM team_member WHERE email = 'alice@example.com'),
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     'LOCKED', 4,
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1) + 1);

INSERT INTO commit_item (id, weekly_commit_id, outcome_id, title, description, chess_category, effort_estimate, impact_estimate, sort_order) VALUES
    ('10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001',
     'Build setup wizard step 1-2', 'Implement account creation and workspace setup steps with validation.',
     'STRATEGIC', 5, 5, 1),
    ('10000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001',
     'Wizard usability testing', 'Run 5 usability tests with beta users and document findings.',
     'STRATEGIC', 3, 5, 2),
    ('10000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000004',
     'Fix CI timeout on integration suite', 'Debug and fix the 12-minute timeout in the integration test stage.',
     'OPERATIONAL', 3, 3, 3),
    ('10000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000005',
     'Feature flag admin UI', 'Build admin panel to create/toggle feature flags.',
     'TACTICAL', 3, 3, 4),
    ('10000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000001',
     NULL,
     'Team standup facilitation', 'Run daily standups and maintain blockers board.',
     'MAINTENANCE', 2, 2, 5);

-- Alice reconciliations: 4 of 5 completed
INSERT INTO reconciliation (id, commit_item_id, completion_status, actual_story_points, notes) VALUES
    ('21000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'COMPLETED', 5, 'Steps 1-2 shipped to staging.'),
    ('21000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'COMPLETED', 3, 'All 5 tests done. Key finding: users skip optional fields.'),
    ('21000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'COMPLETED', 3, 'Root cause: connection pool exhaustion. Fixed and verified.'),
    ('21000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'COMPLETED', 3, 'Admin panel live behind internal feature flag.'),
    ('21000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'PARTIAL', 2, 'Standups running but blockers board needs formatting.');


-- ============================================================
-- 3. CURRENT WEEK — Bob Martinez (LOCKED, has a blocked item)
--    4 items, 2 completed, 1 blocked, mood=3 (down from 4), alignment=75%
-- ============================================================
INSERT INTO weekly_commit (id, team_member_id, week_start, status, mood_score, locked_at) VALUES
    ('f0000000-0000-0000-0000-000000000002',
     (SELECT id FROM team_member WHERE email = 'bob@example.com'),
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     'LOCKED', 3,
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1) + 1);

INSERT INTO commit_item (id, weekly_commit_id, outcome_id, title, description, chess_category, effort_estimate, impact_estimate, sort_order, risk_flag, risk_note, risk_flagged_at) VALUES
    ('10000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000005',
     'Feature flag SDK integration', 'Integrate feature flag SDK into the React app and add provider wrapper.',
     'STRATEGIC', 5, 5, 1, NULL, NULL, NULL),
    ('10000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000004',
     'Parallelize CI test stages', 'Split test suite into 4 parallel runners to hit <10min target.',
     'TACTICAL', 5, 3, 2,
     'BLOCKED', 'Waiting on DevOps to provision additional CI runners.', CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1) + 2),
    ('10000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000007',
     'Wiki content migration plan', 'Create migration plan for moving Notion docs to internal wiki.',
     'TACTICAL', 3, 3, 3, NULL, NULL, NULL),
    ('10000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000002',
     NULL,
     'Dependency security audit', 'Run npm audit + mvn dependency-check and patch critical CVEs.',
     'MAINTENANCE', 2, 2, 4, NULL, NULL, NULL);

-- Bob reconciliations: 2 completed, 1 not started (blocked), 1 partial
INSERT INTO reconciliation (id, commit_item_id, completion_status, actual_story_points, notes) VALUES
    ('21000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'COMPLETED', 5, 'SDK integrated, provider set up, first 2 flags live.'),
    ('21000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', 'NOT_STARTED', NULL, 'Blocked on CI runner provisioning — DevOps ETA is next Tuesday.'),
    ('21000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 'COMPLETED', 3, 'Migration plan documented, 47 pages identified for move.'),
    ('21000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', 'PARTIAL', 2, 'npm audit done, 2 critical CVEs patched. mvn check still pending.');


-- ============================================================
-- 4. CURRENT WEEK — Carol Johnson (DRAFT, at-risk item, mid-sprint)
--    5 items, 0 completed (still drafting), 1 at-risk, mood=5 (same), alignment=60%
-- ============================================================
INSERT INTO weekly_commit (id, team_member_id, week_start, status, mood_score) VALUES
    ('f0000000-0000-0000-0000-000000000003',
     (SELECT id FROM team_member WHERE email = 'carol@example.com'),
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     'DRAFT', 5);

INSERT INTO commit_item (id, weekly_commit_id, outcome_id, title, description, chess_category, effort_estimate, impact_estimate, sort_order, risk_flag, risk_note, risk_flagged_at) VALUES
    ('10000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000002',
     'Onboarding email sequence', 'Write and set up 5-step drip campaign in SendGrid.',
     'STRATEGIC', 5, 5, 1, NULL, NULL, NULL),
    ('10000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000003',
     'Sample project generator service', 'Build backend service to auto-generate demo project on sign-up.',
     'TACTICAL', 5, 5, 2,
     'AT_RISK', 'Depends on new project template schema not yet finalized.', CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1) + 3),
    ('10000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000003',
     'Sample project test data', 'Create realistic test data fixtures for auto-generated projects.',
     'OPERATIONAL', 3, 3, 3, NULL, NULL, NULL),
    ('10000000-0000-0000-0000-000000000013', 'f0000000-0000-0000-0000-000000000003',
     NULL,
     'API documentation refresh', 'Update OpenAPI spec with new sample project endpoints.',
     'OPERATIONAL', 2, 2, 4, NULL, NULL, NULL),
    ('10000000-0000-0000-0000-000000000014', 'f0000000-0000-0000-0000-000000000003',
     NULL,
     'Code review backlog', 'Clear 6 pending PRs in review queue.',
     'MAINTENANCE', 1, 2, 5, NULL, NULL, NULL);


-- ============================================================
-- 5. CURRENT WEEK — Quan Le (RECONCILING, wrapping up)
--    4 items, 3 completed, mood=4 (up from 3), alignment=75%
-- ============================================================
INSERT INTO weekly_commit (id, team_member_id, week_start, status, mood_score, locked_at) VALUES
    ('f0000000-0000-0000-0000-000000000004',
     (SELECT id FROM team_member WHERE email = 'quan.le@challenger.gauntletai.com'),
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     'RECONCILING', 4,
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1) + 1);

INSERT INTO commit_item (id, weekly_commit_id, outcome_id, title, description, chess_category, effort_estimate, impact_estimate, sort_order) VALUES
    ('10000000-0000-0000-0000-000000000015', 'f0000000-0000-0000-0000-000000000004',
     'c0000000-0000-0000-0000-000000000001',
     'Wizard UX review & sign-off', 'Review Alice''s wizard implementation, approve UX flow for production.',
     'STRATEGIC', 3, 5, 1),
    ('10000000-0000-0000-0000-000000000016', 'f0000000-0000-0000-0000-000000000004',
     'c0000000-0000-0000-0000-000000000006',
     'Schedule Q2 tech talk series', 'Finalize speakers, topics, and calendar invites for 8 sessions.',
     'TACTICAL', 3, 3, 2),
    ('10000000-0000-0000-0000-000000000017', 'f0000000-0000-0000-0000-000000000004',
     'c0000000-0000-0000-0000-000000000007',
     'Wiki information architecture', 'Design IA for internal wiki: categories, tagging, search strategy.',
     'STRATEGIC', 5, 5, 3),
    ('10000000-0000-0000-0000-000000000018', 'f0000000-0000-0000-0000-000000000004',
     NULL,
     'Sprint retro & planning', 'Facilitate sprint retrospective and plan next sprint scope.',
     'OPERATIONAL', 2, 2, 4);

-- Quan reconciliations: 3 completed, 1 partial
INSERT INTO reconciliation (id, commit_item_id, completion_status, actual_story_points, notes) VALUES
    ('21000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000015', 'COMPLETED', 3, 'UX approved with minor copy tweaks. Ship-ready.'),
    ('21000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000016', 'COMPLETED', 3, 'All 8 sessions scheduled. First one next Wednesday.'),
    ('21000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000017', 'COMPLETED', 5, 'IA finalized: 6 top categories, 24 subcategories, tag taxonomy.'),
    ('21000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000018', 'PARTIAL', 2, 'Retro done, planning 70% complete — needs final prioritization.');


-- ============================================================
-- 6. High Fives (Team Pulse)
-- ============================================================
INSERT INTO high_five (id, giver_id, receiver_team_id, receiver_member_id, week_start, message, is_public) VALUES
    ('30000000-0000-0000-0000-000000000001',
     (SELECT id FROM team_member WHERE email = 'quan.le@challenger.gauntletai.com'),
     'd0000000-0000-0000-0000-000000000001',
     (SELECT id FROM team_member WHERE email = 'alice@example.com'),
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     'Amazing work on the setup wizard! The usability test results were really insightful. Ship it!',
     true),
    ('30000000-0000-0000-0000-000000000002',
     (SELECT id FROM team_member WHERE email = 'alice@example.com'),
     'd0000000-0000-0000-0000-000000000001',
     (SELECT id FROM team_member WHERE email = 'bob@example.com'),
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     'Feature flag SDK integration was seamless. Great API design and documentation.',
     true),
    ('30000000-0000-0000-0000-000000000003',
     (SELECT id FROM team_member WHERE email = 'bob@example.com'),
     'd0000000-0000-0000-0000-000000000001',
     (SELECT id FROM team_member WHERE email = 'carol@example.com'),
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     'The onboarding email copy is fantastic — clear, friendly, and on-brand. Users are going to love it.',
     true),
    ('30000000-0000-0000-0000-000000000004',
     (SELECT id FROM team_member WHERE email = 'carol@example.com'),
     'd0000000-0000-0000-0000-000000000001',
     (SELECT id FROM team_member WHERE email = 'quan.le@challenger.gauntletai.com'),
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     'The wiki IA is incredibly well thought out. The tag taxonomy will save everyone so much time.',
     true);


-- ============================================================
-- 7. Retrospective Entries (Team Pulse)
-- ============================================================
INSERT INTO retrospective_entry (id, team_member_id, week_start, outcome_id, prompt_key, response) VALUES
    -- Alice
    ('40000000-0000-0000-0000-000000000001',
     (SELECT id FROM team_member WHERE email = 'alice@example.com'),
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     'c0000000-0000-0000-0000-000000000001',
     'what_went_well',
     'Setup wizard steps 1-2 shipped ahead of schedule. Usability tests revealed key insights about optional fields that will improve conversion.'),
    ('40000000-0000-0000-0000-000000000002',
     (SELECT id FROM team_member WHERE email = 'alice@example.com'),
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     NULL,
     'what_to_improve',
     'Need to timebox standup facilitation — it''s eating into dev time. Consider rotating the facilitator role.'),

    -- Bob
    ('40000000-0000-0000-0000-000000000003',
     (SELECT id FROM team_member WHERE email = 'bob@example.com'),
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     'c0000000-0000-0000-0000-000000000004',
     'what_went_well',
     'Feature flag SDK came together cleanly. The provider pattern made React integration straightforward.'),
    ('40000000-0000-0000-0000-000000000004',
     (SELECT id FROM team_member WHERE email = 'bob@example.com'),
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     NULL,
     'what_to_improve',
     'CI parallelization is blocked on DevOps — need to escalate faster when cross-team dependencies stall.'),

    -- Carol
    ('40000000-0000-0000-0000-000000000005',
     (SELECT id FROM team_member WHERE email = 'carol@example.com'),
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     'c0000000-0000-0000-0000-000000000002',
     'what_went_well',
     'Email sequence writing is flowing well. Got great feedback from marketing on tone and CTAs.'),
    ('40000000-0000-0000-0000-000000000006',
     (SELECT id FROM team_member WHERE email = 'carol@example.com'),
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     NULL,
     'what_to_improve',
     'Project template schema dependency is blocking sample project work. Should have flagged this earlier in planning.'),

    -- Quan
    ('40000000-0000-0000-0000-000000000007',
     (SELECT id FROM team_member WHERE email = 'quan.le@challenger.gauntletai.com'),
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     'c0000000-0000-0000-0000-000000000007',
     'what_went_well',
     'Wiki IA design got buy-in from all teams. The tag taxonomy approach was well-received and should scale.'),
    ('40000000-0000-0000-0000-000000000008',
     (SELECT id FROM team_member WHERE email = 'quan.le@challenger.gauntletai.com'),
     CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1),
     NULL,
     'what_to_improve',
     'Sprint planning took too long — need a tighter agenda and pre-read materials to keep it under 90 minutes.');
