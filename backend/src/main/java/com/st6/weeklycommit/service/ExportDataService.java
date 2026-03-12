package com.st6.weeklycommit.service;

import com.st6.weeklycommit.model.dto.BlockedItemDto;
import com.st6.weeklycommit.model.dto.DashboardTeamDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ExportDataService {

    private final DashboardService dashboardService;

    public ExportDataService(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    public DashboardTeamDto getTeamData(UUID teamId) {
        return dashboardService.getTeamDashboard(teamId);
    }

    public List<BlockedItemDto> getBlockedItems(UUID teamId) {
        return dashboardService.getBlockedItems(teamId);
    }
}
