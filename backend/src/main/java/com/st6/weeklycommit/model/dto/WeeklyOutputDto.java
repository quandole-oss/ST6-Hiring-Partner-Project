package com.st6.weeklycommit.model.dto;

import java.time.LocalDate;

public record WeeklyOutputDto(LocalDate weekStart, int storyPoints, int itemCount, String status) {}
