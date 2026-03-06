package com.st6.weeklycommit.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateDefiningObjectiveRequest(@NotNull UUID rallyCryId, @NotBlank String title, String description) {}
