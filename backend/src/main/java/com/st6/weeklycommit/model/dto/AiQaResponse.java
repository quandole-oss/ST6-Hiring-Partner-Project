package com.st6.weeklycommit.model.dto;

import java.time.Instant;

public record AiQaResponse(String question, String answer, Instant generatedAt) {}
