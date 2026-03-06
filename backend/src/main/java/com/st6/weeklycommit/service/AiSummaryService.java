package com.st6.weeklycommit.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.st6.weeklycommit.config.AnthropicConfig;
import com.st6.weeklycommit.model.dto.BlockedItemDto;
import com.st6.weeklycommit.model.dto.DashboardTeamDto;
import com.st6.weeklycommit.model.dto.TeamSummaryDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AiSummaryService {

    private static final Logger log = LoggerFactory.getLogger(AiSummaryService.class);

    private final DashboardService dashboardService;
    private final AnthropicConfig config;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public AiSummaryService(DashboardService dashboardService, AnthropicConfig config, ObjectMapper objectMapper) {
        this.dashboardService = dashboardService;
        this.config = config;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.anthropic.com/v1")
                .build();
    }

    public TeamSummaryDto generateSummary(UUID teamId) {
        if (!config.isEnabled() || config.getAnthropicApiKey().isBlank()) {
            throw new IllegalStateException("AI summaries are disabled or API key not configured");
        }

        var dashboard = dashboardService.getTeamDashboard(teamId);
        var blockedItems = dashboardService.getBlockedItems(teamId);

        String prompt = buildPrompt(dashboard, blockedItems);

        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", config.getModel());
            requestBody.put("max_tokens", config.getMaxTokens());

            ArrayNode messages = requestBody.putArray("messages");
            ObjectNode message = messages.addObject();
            message.put("role", "user");
            message.put("content", prompt);

            requestBody.put("system", "You are a concise project manager assistant. Produce a 2-3 sentence synthesis highlighting the team's completion rate, RCDO alignment, and any BLOCKED items. Be direct and actionable.");

            String responseStr = restClient.post()
                    .uri("/messages")
                    .header("x-api-key", config.getAnthropicApiKey())
                    .header("anthropic-version", "2023-06-01")
                    .header("content-type", "application/json")
                    .body(objectMapper.writeValueAsString(requestBody))
                    .retrieve()
                    .body(String.class);

            JsonNode response = objectMapper.readTree(responseStr);
            String summary = response.path("content").get(0).path("text").asText();

            return new TeamSummaryDto(teamId, dashboard.teamName(), summary, Instant.now());
        } catch (Exception e) {
            log.error("Failed to generate AI summary for team {}", teamId, e);
            throw new IllegalStateException("Failed to generate AI summary: " + e.getMessage());
        }
    }

    private String buildPrompt(DashboardTeamDto dashboard, java.util.List<BlockedItemDto> blockedItems) {
        var sb = new StringBuilder();
        sb.append("Team: ").append(dashboard.teamName()).append("\n\n");
        sb.append("Member Metrics:\n");
        for (var m : dashboard.members()) {
            sb.append("- ").append(m.memberName())
              .append(": ").append(m.totalItems()).append(" items, ")
              .append(m.completedItems()).append(" completed, ")
              .append(m.totalStoryPoints()).append(" SP committed, ")
              .append(m.completedStoryPoints()).append(" SP completed, ")
              .append(Math.round(m.completionRate() * 100)).append("% completion, ")
              .append(Math.round(m.alignmentScore() * 100)).append("% alignment")
              .append("\n");
        }

        if (!blockedItems.isEmpty()) {
            sb.append("\nBLOCKED Items:\n");
            for (var item : blockedItems) {
                sb.append("- ").append(item.itemTitle())
                  .append(" (").append(item.memberName()).append(")")
                  .append(item.riskNote() != null ? " — Reason: " + item.riskNote() : "")
                  .append("\n");
            }
        }

        sb.append("\nSummarize this team's weekly performance in 2-3 sentences.");
        return sb.toString();
    }
}
