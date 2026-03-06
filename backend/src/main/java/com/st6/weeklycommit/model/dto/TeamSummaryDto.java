package com.st6.weeklycommit.model.dto;

import java.time.Instant;
import java.util.UUID;

public record TeamSummaryDto(UUID teamId, String teamName, String summary, Instant generatedAt) {}
