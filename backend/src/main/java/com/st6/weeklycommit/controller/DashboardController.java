package com.st6.weeklycommit.controller;

import com.st6.weeklycommit.model.dto.*;
import com.st6.weeklycommit.service.AiQaService;
import com.st6.weeklycommit.service.AiSummaryService;
import com.st6.weeklycommit.service.DashboardService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AiSummaryService aiSummaryService;
    private final AiQaService aiQaService;

    public DashboardController(DashboardService dashboardService, AiSummaryService aiSummaryService, AiQaService aiQaService) {
        this.dashboardService = dashboardService;
        this.aiSummaryService = aiSummaryService;
        this.aiQaService = aiQaService;
    }

    @GetMapping("/team/{teamId}")
    public DashboardTeamDto teamDashboard(@PathVariable UUID teamId) { return dashboardService.getTeamDashboard(teamId); }

    @GetMapping("/alignment")
    public AlignmentScoreDto alignmentMetrics() { return dashboardService.getAlignmentMetrics(); }

    @GetMapping("/team/{teamId}/blocked-items")
    public List<BlockedItemDto> blockedItems(@PathVariable UUID teamId) { return dashboardService.getBlockedItems(teamId); }

    @GetMapping("/team/{teamId}/summary")
    public TeamSummaryDto teamSummary(@PathVariable UUID teamId) { return aiSummaryService.generateSummary(teamId); }

    @PostMapping("/ai/ask")
    public AiQaResponse askQuestion(@Valid @RequestBody AiQaRequest request) {
        return aiQaService.askQuestion(request.question(), request.teamId());
    }
}
