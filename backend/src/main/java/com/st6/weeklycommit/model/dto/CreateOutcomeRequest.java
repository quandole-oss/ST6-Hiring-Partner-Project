package com.st6.weeklycommit.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateOutcomeRequest(@NotNull UUID definingObjectiveId, @NotBlank String title, String description) {}
