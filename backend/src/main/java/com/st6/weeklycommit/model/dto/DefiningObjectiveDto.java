package com.st6.weeklycommit.model.dto;

import java.util.List;
import java.util.UUID;

public record DefiningObjectiveDto(UUID id, UUID rallyCryId, String title, String description, List<OutcomeDto> outcomes) {}
