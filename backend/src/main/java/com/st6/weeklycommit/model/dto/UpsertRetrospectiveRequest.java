package com.st6.weeklycommit.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record UpsertRetrospectiveRequest(
    @NotNull LocalDate weekStart,
    UUID outcomeId,
    @NotBlank String promptKey,
    @NotBlank String response
) {}
