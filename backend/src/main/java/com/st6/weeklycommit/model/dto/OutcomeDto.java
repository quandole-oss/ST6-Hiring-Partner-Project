package com.st6.weeklycommit.model.dto;

import java.util.UUID;

public record OutcomeDto(UUID id, UUID definingObjectiveId, String title, String description) {}
