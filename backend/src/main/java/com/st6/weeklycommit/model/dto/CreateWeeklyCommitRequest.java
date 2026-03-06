package com.st6.weeklycommit.model.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record CreateWeeklyCommitRequest(@NotNull UUID teamMemberId, @NotNull LocalDate weekStart) {}
