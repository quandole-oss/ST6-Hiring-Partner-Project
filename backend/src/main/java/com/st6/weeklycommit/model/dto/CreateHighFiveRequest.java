package com.st6.weeklycommit.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateHighFiveRequest(
    @NotNull UUID receiverTeamId,
    @NotNull LocalDate weekStart,
    @NotBlank String message,
    @NotNull Boolean isPublic
) {}
