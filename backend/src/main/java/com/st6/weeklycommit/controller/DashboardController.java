package com.st6.weeklycommit.controller;

import com.st6.weeklycommit.model.dto.AlignmentScoreDto;
import com.st6.weeklycommit.model.dto.BlockedItemDto;
import com.st6.weeklycommit.model.dto.DashboardTeamDto;
import com.st6.weeklycommit.model.dto.TeamSummaryDto;
import com.st6.weeklycommit.service.AiSummaryService;
import com.st6.weeklycommit.service.DashboardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AiSummaryService aiSummaryService;

    public DashboardController(DashboardService dashboardService, AiSummaryService aiSummaryService) {
        this.dashboardService = dashboardService;
        this.aiSummaryService = aiSummaryService;
    }

    @GetMapping("/team/{teamId}")
    public DashboardTeamDto teamDashboard(@PathVariable UUID teamId) { return dashboardService.getTeamDashboard(teamId); }

    @GetMapping("/alignment")
    public AlignmentScoreDto alignmentMetrics() { return dashboardService.getAlignmentMetrics(); }

    @GetMapping("/team/{teamId}/blocked-items")
    public List<BlockedItemDto> blockedItems(@PathVariable UUID teamId) { return dashboardService.getBlockedItems(teamId); }

    @GetMapping("/team/{teamId}/summary")
    public TeamSummaryDto teamSummary(@PathVariable UUID teamId) { return aiSummaryService.generateSummary(teamId); }
}
