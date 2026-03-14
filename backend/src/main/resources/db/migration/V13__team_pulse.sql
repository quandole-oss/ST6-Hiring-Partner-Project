-- High Five: team recognition with visibility control
CREATE TABLE high_five (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    giver_id         UUID NOT NULL REFERENCES team_member(id) ON DELETE CASCADE,
    receiver_team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    week_start       DATE NOT NULL,
    message          TEXT NOT NULL,
    is_public        BOOLEAN NOT NULL DEFAULT true,
    created_at       TIMESTAMP NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (giver_id, receiver_team_id, week_start)
);

CREATE INDEX idx_high_five_week ON high_five(week_start);
CREATE INDEX idx_high_five_receiver ON high_five(receiver_team_id);

-- Retrospective: weekly RCDO-linked reflection entries
CREATE TABLE retrospective_entry (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_member_id  UUID NOT NULL REFERENCES team_member(id) ON DELETE CASCADE,
    week_start      DATE NOT NULL,
    outcome_id      UUID REFERENCES outcome(id) ON DELETE SET NULL,
    prompt_key      VARCHAR(100) NOT NULL,
    response        TEXT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (team_member_id, week_start, prompt_key)
);

CREATE INDEX idx_retro_entry_member_week ON retrospective_entry(team_member_id, week_start);
