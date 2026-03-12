package com.st6.weeklycommit.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.st6.weeklycommit.config.AnthropicConfig;
import com.st6.weeklycommit.model.dto.AiQaResponse;
import com.st6.weeklycommit.model.entity.WeeklyCommit;
import com.st6.weeklycommit.repository.WeeklyCommitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.UUID;

@Service
public class AiQaService {

    private static final Logger log = LoggerFactory.getLogger(AiQaService.class);

    private final AnthropicConfig config;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;
    private final WeeklyCommitRepository commitRepo;

    public AiQaService(AnthropicConfig config, ObjectMapper objectMapper, WeeklyCommitRepository commitRepo) {
        this.config = config;
        this.objectMapper = objectMapper;
        this.commitRepo = commitRepo;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(30));
        this.restClient = RestClient.builder()
                .baseUrl("https://api.anthropic.com/v1")
                .requestFactory(requestFactory)
                .build();
    }

    public AiQaResponse askQuestion(String question, UUID teamId) {
        if (!config.isEnabled() || config.getAnthropicApiKey().isBlank()) {
            throw new IllegalStateException("AI features are disabled or API key not configured");
        }

        String context = buildContext(teamId);

        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", config.getModel());
            requestBody.put("max_tokens", config.getQaMaxTokens());

            requestBody.put("system", "You are an intelligent project management assistant with full access to the team's weekly commit data. "
                    + "You can answer questions about team members, their work items, story points, completion rates, blocked items, "
                    + "RCDO alignment, and team trends. Be helpful, concise, and data-driven in your responses. "
                    + "If the data doesn't contain enough information to answer, say so clearly.");

            ArrayNode messages = requestBody.putArray("messages");
            ObjectNode message = messages.addObject();
            message.put("role", "user");
            message.put("content", context + "\n\nQuestion: " + question);

            String responseStr = restClient.post()
                    .uri("/messages")
                    .header("x-api-key", config.getAnthropicApiKey())
                    .header("anthropic-version", "2023-06-01")
                    .header("content-type", "application/json")
                    .body(objectMapper.writeValueAsString(requestBody))
                    .retrieve()
                    .body(String.class);

            JsonNode response = objectMapper.readTree(responseStr);
            String answer = response.path("content").get(0).path("text").asText();

            return new AiQaResponse(question, answer, Instant.now());
        } catch (Exception e) {
            log.error("Failed to process AI Q&A", e);
            throw new IllegalStateException("Failed to process question: " + e.getMessage());
        }
    }

    private String buildContext(UUID teamId) {
        LocalDate currentWeekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate prevWeekStart = currentWeekStart.minusWeeks(1);

        List<WeeklyCommit> currentWeekCommits = commitRepo.findAllByWeekStartWithItemsAndMembers(currentWeekStart);
        List<WeeklyCommit> prevWeekCommits = commitRepo.findAllByWeekStartWithItemsAndMembers(prevWeekStart);

        // Filter by team if specified
        if (teamId != null) {
            currentWeekCommits = currentWeekCommits.stream()
                    .filter(c -> c.getTeamMember().getTeam().getId().equals(teamId))
                    .toList();
            prevWeekCommits = prevWeekCommits.stream()
                    .filter(c -> c.getTeamMember().getTeam().getId().equals(teamId))
                    .toList();
        }

        StringBuilder sb = new StringBuilder();
        sb.append("=== WEEKLY COMMIT DATA ===\n\n");

        sb.append("--- CURRENT WEEK (").append(currentWeekStart).append(") ---\n");
        appendCommitData(sb, currentWeekCommits);

        sb.append("\n--- PREVIOUS WEEK (").append(prevWeekStart).append(") ---\n");
        appendCommitData(sb, prevWeekCommits);

        return sb.toString();
    }

    private void appendCommitData(StringBuilder sb, List<WeeklyCommit> commits) {
        if (commits.isEmpty()) {
            sb.append("No commits found for this week.\n");
            return;
        }

        for (WeeklyCommit commit : commits) {
            String memberName = commit.getTeamMember().getName();
            String teamName = commit.getTeamMember().getTeam().getName();
            sb.append("\nMember: ").append(memberName).append(" (Team: ").append(teamName).append(")\n");
            sb.append("Status: ").append(commit.getStatus()).append("\n");

            if (commit.getItems().isEmpty()) {
                sb.append("  No items\n");
            } else {
                int totalSP = 0;
                int blockedCount = 0;
                for (var item : commit.getItems()) {
                    int sp = item.getEffortEstimate() != null ? item.getEffortEstimate() : 0;
                    totalSP += sp;
                    String category = item.getChessCategory() != null ? item.getChessCategory().name() : "UNCATEGORIZED";
                    String outcome = item.getOutcome() != null ? item.getOutcome().getTitle() : "Unlinked";

                    sb.append("  - ").append(item.getTitle());
                    if (item.getDescription() != null && !item.getDescription().isBlank()) {
                        sb.append(": ").append(item.getDescription());
                    }
                    sb.append(" [").append(category).append(", ").append(sp).append(" SP");
                    sb.append(", Outcome: ").append(outcome);

                    if (item.getRiskFlag() != null) {
                        sb.append(", ").append(item.getRiskFlag());
                        if (item.getRiskNote() != null) sb.append(": ").append(item.getRiskNote());
                        blockedCount++;
                    }

                    if (item.getReconciliation() != null) {
                        sb.append(", Reconciled: ").append(item.getReconciliation().getCompletionStatus());
                    }

                    sb.append("]\n");
                }
                sb.append("  Total SP: ").append(totalSP);
                if (blockedCount > 0) sb.append(" | Blocked/At-Risk: ").append(blockedCount);
                sb.append("\n");
            }
        }
    }
}
