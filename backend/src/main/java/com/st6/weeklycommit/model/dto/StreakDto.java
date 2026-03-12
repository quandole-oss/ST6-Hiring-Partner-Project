package com.st6.weeklycommit.model.dto;

import java.util.List;

public record StreakDto(int currentStreak, int longestStreak, List<Boolean> lastTwelveWeeks) {}
