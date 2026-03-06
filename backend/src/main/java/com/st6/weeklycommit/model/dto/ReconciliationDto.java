package com.st6.weeklycommit.model.dto;

import com.st6.weeklycommit.model.entity.CompletionStatus;
import java.util.UUID;

public record ReconciliationDto(UUID id, UUID commitItemId, CompletionStatus completionStatus, String notes, Integer actualStoryPoints) {}
