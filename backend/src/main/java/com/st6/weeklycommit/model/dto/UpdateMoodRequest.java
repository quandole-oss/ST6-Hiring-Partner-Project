package com.st6.weeklycommit.model.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateMoodRequest(@NotNull @Min(1) @Max(5) Integer moodScore) {}
