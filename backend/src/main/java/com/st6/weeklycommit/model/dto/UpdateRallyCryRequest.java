package com.st6.weeklycommit.model.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateRallyCryRequest(@NotBlank String title, String description) {}
