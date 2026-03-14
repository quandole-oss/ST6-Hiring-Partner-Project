package com.st6.weeklycommit.model.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record RetrospectiveEntryDto(
    UUID id,
    UUID teamMemberId,
    LocalDate weekStart,
    UUID outcomeId,
    String outcomeTitle,
    String promptKey,
    String response,
    Instant createdAt
) {}
