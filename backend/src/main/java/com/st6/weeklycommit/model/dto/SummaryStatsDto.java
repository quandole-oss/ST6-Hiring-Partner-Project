package com.st6.weeklycommit.model.dto;

public record SummaryStatsDto(int totalWeeks, int totalItems, int totalStoryPoints, double completionRate, double avgStoryPointsPerWeek) {}
