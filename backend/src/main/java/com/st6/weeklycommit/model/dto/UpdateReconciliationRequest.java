package com.st6.weeklycommit.model.dto;

import com.st6.weeklycommit.model.entity.CompletionStatus;
import com.st6.weeklycommit.validation.ValidFibonacci;
import jakarta.validation.constraints.NotNull;

public record UpdateReconciliationRequest(@NotNull CompletionStatus completionStatus, String notes, @ValidFibonacci Integer actualStoryPoints) {}
