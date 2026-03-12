package com.st6.weeklycommit.model.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record AiQaRequest(@NotBlank String question, UUID teamId) {}
