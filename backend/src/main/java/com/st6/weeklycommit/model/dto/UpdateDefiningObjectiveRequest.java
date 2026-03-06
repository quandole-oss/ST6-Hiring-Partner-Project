package com.st6.weeklycommit.model.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateDefiningObjectiveRequest(@NotBlank String title, String description) {}
