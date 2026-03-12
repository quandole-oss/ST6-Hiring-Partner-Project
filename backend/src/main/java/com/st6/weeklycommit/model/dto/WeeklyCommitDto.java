package com.st6.weeklycommit.model.dto;

import com.st6.weeklycommit.model.entity.CommitStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record WeeklyCommitDto(UUID id, UUID teamMemberId, String teamMemberName, LocalDate weekStart, CommitStatus status, Instant lockedAt, Instant reconciledAt, List<CommitItemDto> items, boolean hasBlockedItems, Integer moodScore) {}
