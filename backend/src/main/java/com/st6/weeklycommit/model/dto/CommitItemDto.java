package com.st6.weeklycommit.model.dto;

import com.st6.weeklycommit.model.entity.ChessCategory;
import java.time.Instant;
import java.util.UUID;

public record CommitItemDto(UUID id, UUID weeklyCommitId, UUID outcomeId, String outcomeTitle, String title, String description, ChessCategory chessCategory, Integer effortEstimate, Integer impactEstimate, int sortOrder, ReconciliationDto reconciliation, int carryForwardCount, boolean flaggedStale, String riskFlag, String riskNote, Instant riskFlaggedAt) {}
