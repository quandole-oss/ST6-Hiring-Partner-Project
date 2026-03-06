-- Audit: commit created
INSERT INTO audit_log (id, weekly_commit_id, commit_item_id, action_type,
    triggered_by, previous_state, new_state, is_manual_override, created_at)
VALUES (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000001', NULL,
    'STATE_TRANSITION', 'alice@example.com', NULL, 'DRAFT', false,
    date_trunc('week', CURRENT_DATE) + interval '9 hours');

-- Audit: items added
INSERT INTO audit_log (id, weekly_commit_id, commit_item_id, action_type,
    triggered_by, is_manual_override, created_at)
VALUES
  (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001', 'ITEM_ADDED', 'alice@example.com',
   false, date_trunc('week', CURRENT_DATE) + interval '9 hours 5 minutes'),
  (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000002', 'ITEM_ADDED', 'alice@example.com',
   false, date_trunc('week', CURRENT_DATE) + interval '9 hours 10 minutes'),
  (gen_random_uuid(), 'f0000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000003', 'ITEM_ADDED', 'alice@example.com',
   false, date_trunc('week', CURRENT_DATE) + interval '9 hours 15 minutes');
