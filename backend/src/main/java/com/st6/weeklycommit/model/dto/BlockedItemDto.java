package com.st6.weeklycommit.model.dto;

import java.time.Instant;
import java.util.UUID;

public record BlockedItemDto(UUID itemId, UUID commitId, UUID memberId, String memberName, String itemTitle, String riskFlag, String riskNote, Instant riskFlaggedAt) {}
