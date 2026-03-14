package com.st6.weeklycommit.model.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record HighFiveDto(
    UUID id,
    UUID giverId,
    String giverName,
    UUID receiverTeamId,
    String receiverTeamName,
    UUID receiverMemberId,
    String receiverMemberName,
    LocalDate weekStart,
    String message,
    boolean isPublic,
    Instant createdAt
) {}
