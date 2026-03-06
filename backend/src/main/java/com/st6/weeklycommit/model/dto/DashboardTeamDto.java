package com.st6.weeklycommit.model.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record DashboardTeamDto(UUID teamId, String teamName, List<DashboardMemberDto> members, Map<String, Integer> categoryBreakdown) {}
