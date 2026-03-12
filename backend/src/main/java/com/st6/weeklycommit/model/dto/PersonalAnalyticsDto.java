package com.st6.weeklycommit.model.dto;

import java.util.List;
import java.util.UUID;

public record PersonalAnalyticsDto(
    UUID memberId,
    String memberName,
    SummaryStatsDto summary,
    StreakDto streak,
    List<WeeklyOutputDto> outputTrend,
    List<DayActivityDto> busiestDays,
    List<CategoryBreakdownDto> categoryBreakdown
) {}
