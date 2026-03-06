package com.st6.weeklycommit.model.dto;

import com.st6.weeklycommit.model.entity.CommitStatus;
import java.time.Instant;
import java.util.UUID;

public record AuditLogDto(UUID id, UUID commitId, CommitStatus previousState, CommitStatus newState, String triggeredBy, boolean isManualOverride, String notes, Instant createdAt, UUID commitItemId, String commitItemTitle, String actionType, String oldValue, String newValue) {}
