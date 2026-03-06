package com.st6.weeklycommit.service;

import com.st6.weeklycommit.model.dto.AlignmentScoreDto;
import com.st6.weeklycommit.model.dto.BlockedItemDto;
import com.st6.weeklycommit.model.dto.DashboardMemberDto;
import com.st6.weeklycommit.model.dto.DashboardTeamDto;
import com.st6.weeklycommit.model.entity.CommitItem;
import com.st6.weeklycommit.model.entity.CompletionStatus;
import com.st6.weeklycommit.model.entity.WeeklyCommit;
import com.st6.weeklycommit.repository.TeamRepository;
import com.st6.weeklycommit.repository.WeeklyCommitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final TeamRepository teamRepo;
    private final WeeklyCommitRepository commitRepo;

    public DashboardService(TeamRepository teamRepo, WeeklyCommitRepository commitRepo) {
        this.teamRepo = teamRepo;
        this.commitRepo = commitRepo;
    }

    public DashboardTeamDto getTeamDashboard(UUID teamId) {
        var team = teamRepo.findById(teamId).orElseThrow(() -> new IllegalArgumentException("Team not found: " + teamId));
        LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        var commits = commitRepo.findByTeamIdAndWeekStart(teamId, weekStart);

        var memberDtos = team.getMembers().stream().map(member -> {
            var commitOpt = commits.stream().filter(c -> c.getTeamMember().getId().equals(member.getId())).findFirst();
            if (commitOpt.isEmpty()) {
                return new DashboardMemberDto(member.getId(), member.getName(), null, 0, 0, 0, 0.0, 0.0, 0, 0, 0, 0);
            }
            var commit = commitOpt.get();
            var items = commit.getItems();
            int total = items.size();
            int completed = countByStatus(items, CompletionStatus.COMPLETED);
            int partial = countByStatus(items, CompletionStatus.PARTIAL);
            double completionRate = total > 0 ? (completed + partial * 0.5) / total : 0.0;
            double alignment = computeAlignment(items);
            int totalStoryPoints = items.stream()
                    .mapToInt(i -> i.getEffortEstimate() != null ? i.getEffortEstimate() : 0).sum();
            int completedStoryPoints = items.stream()
                    .filter(i -> i.getReconciliation() != null && i.getReconciliation().getCompletionStatus() == CompletionStatus.COMPLETED)
                    .mapToInt(i -> i.getEffortEstimate() != null ? i.getEffortEstimate() : 0).sum();
            int blocked = (int) items.stream().filter(i -> "BLOCKED".equals(i.getRiskFlag())).count();
            int atRisk = (int) items.stream().filter(i -> "AT_RISK".equals(i.getRiskFlag())).count();
            return new DashboardMemberDto(member.getId(), member.getName(), commit.getStatus(), total, completed, partial, completionRate, alignment, totalStoryPoints, completedStoryPoints, blocked, atRisk);
        }).toList();

        Map<String, Integer> categoryBreakdown = commits.stream()
                .flatMap(c -> c.getItems().stream())
                .filter(i -> i.getChessCategory() != null)
                .collect(Collectors.groupingBy(
                        i -> i.getChessCategory().name(),
                        Collectors.summingInt(e -> 1)));

        return new DashboardTeamDto(teamId, team.getName(), memberDtos, categoryBreakdown);
    }

    public List<BlockedItemDto> getBlockedItems(UUID teamId) {
        LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        var commits = commitRepo.findByTeamIdAndWeekStart(teamId, weekStart);
        return commits.stream()
                .flatMap(c -> c.getItems().stream()
                        .filter(i -> i.getRiskFlag() != null)
                        .map(i -> new BlockedItemDto(i.getId(), c.getId(), c.getTeamMember().getId(), c.getTeamMember().getName(), i.getTitle(), i.getRiskFlag(), i.getRiskNote(), i.getRiskFlaggedAt())))
                .toList();
    }

    public AlignmentScoreDto getAlignmentMetrics() {
        LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        var allCommits = commitRepo.findAll().stream().filter(c -> c.getWeekStart().equals(weekStart)).toList();
        int totalItems = 0;
        int linkedItems = 0;
        for (var commit : allCommits) {
            for (var item : commit.getItems()) {
                totalItems++;
                if (item.getOutcome() != null) linkedItems++;
            }
        }
        double alignment = totalItems > 0 ? (double) linkedItems / totalItems : 0.0;
        return new AlignmentScoreDto(alignment, totalItems, linkedItems, totalItems - linkedItems);
    }

    private int countByStatus(List<CommitItem> items, CompletionStatus status) {
        return (int) items.stream().filter(i -> i.getReconciliation() != null && i.getReconciliation().getCompletionStatus() == status).count();
    }

    private double computeAlignment(List<CommitItem> items) {
        if (items.isEmpty()) return 0.0;
        long linked = items.stream().filter(i -> i.getOutcome() != null).count();
        return (double) linked / items.size();
    }
}
