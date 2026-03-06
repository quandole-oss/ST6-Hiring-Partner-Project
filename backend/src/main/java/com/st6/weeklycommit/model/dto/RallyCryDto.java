package com.st6.weeklycommit.model.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RallyCryDto(UUID id, String title, String description, Instant createdAt, List<DefiningObjectiveDto> definingObjectives) {}
