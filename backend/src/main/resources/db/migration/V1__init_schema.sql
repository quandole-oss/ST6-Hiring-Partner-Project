-- V1__init_schema.sql
-- Weekly Commit Module — full relational schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- RCDO hierarchy
-- ============================================================

CREATE TABLE rally_cry (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE defining_objective (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rally_cry_id  UUID NOT NULL REFERENCES rally_cry(id) ON DELETE CASCADE,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    created_at    TIMESTAMP NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_defining_objective_rally_cry ON defining_objective(rally_cry_id);

CREATE TABLE outcome (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defining_objective_id   UUID NOT NULL REFERENCES defining_objective(id) ON DELETE CASCADE,
    title                   VARCHAR(255) NOT NULL,
    description             TEXT,
    created_at              TIMESTAMP NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_outcome_defining_objective ON outcome(defining_objective_id);

-- ============================================================
-- Teams
-- ============================================================

CREATE TABLE team (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE team_member (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id     UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    role        VARCHAR(100) NOT NULL DEFAULT 'MEMBER',
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_team_member_team ON team_member(team_id);

-- ============================================================
-- Weekly commits
-- ============================================================

CREATE TYPE commit_status AS ENUM (
    'DRAFT',
    'LOCKED',
    'RECONCILING',
    'RECONCILED',
    'CARRY_FORWARD'
);

CREATE TYPE chess_category AS ENUM (
    'STRATEGIC',
    'TACTICAL',
    'OPERATIONAL',
    'MAINTENANCE'
);

CREATE TABLE weekly_commit (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_member_id  UUID NOT NULL REFERENCES team_member(id) ON DELETE CASCADE,
    week_start      DATE NOT NULL,
    status          commit_status NOT NULL DEFAULT 'DRAFT',
    locked_at       TIMESTAMP,
    reconciled_at   TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (team_member_id, week_start)
);

CREATE INDEX idx_weekly_commit_member ON weekly_commit(team_member_id);
CREATE INDEX idx_weekly_commit_week   ON weekly_commit(week_start);
CREATE INDEX idx_weekly_commit_status ON weekly_commit(status);

CREATE TABLE commit_item (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_commit_id  UUID NOT NULL REFERENCES weekly_commit(id) ON DELETE CASCADE,
    outcome_id        UUID REFERENCES outcome(id) ON DELETE SET NULL,
    title             VARCHAR(255) NOT NULL,
    description       TEXT,
    chess_category    chess_category,
    effort_estimate   INT CHECK (effort_estimate BETWEEN 1 AND 5),
    impact_estimate   INT CHECK (impact_estimate BETWEEN 1 AND 5),
    sort_order        INT NOT NULL DEFAULT 0,
    created_at        TIMESTAMP NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_commit_item_commit  ON commit_item(weekly_commit_id);
CREATE INDEX idx_commit_item_outcome ON commit_item(outcome_id);

-- ============================================================
-- Reconciliation
-- ============================================================

CREATE TYPE completion_status AS ENUM (
    'COMPLETED',
    'PARTIAL',
    'NOT_STARTED',
    'DEFERRED'
);

CREATE TABLE reconciliation (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commit_item_id      UUID NOT NULL UNIQUE REFERENCES commit_item(id) ON DELETE CASCADE,
    completion_status   completion_status NOT NULL,
    notes               TEXT,
    actual_effort       INT CHECK (actual_effort BETWEEN 1 AND 5),
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now()
);
