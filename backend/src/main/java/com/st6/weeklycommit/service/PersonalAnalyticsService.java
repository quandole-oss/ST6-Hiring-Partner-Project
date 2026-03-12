package com.st6.weeklycommit.service;

import com.st6.weeklycommit.model.dto.*;
import com.st6.weeklycommit.model.entity.CommitItem;
import com.st6.weeklycommit.model.entity.CommitStatus;
import com.st6.weeklycommit.model.entity.CompletionStatus;
import com.st6.weeklycommit.model.entity.WeeklyCommit;
import com.st6.weeklycommit.repository.TeamMemberRepository;
import com.st6.weeklycommit.repository.WeeklyCommitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PersonalAnalyticsService {

    private final WeeklyCommitRepository commitRepo;
    private final TeamMemberRepository memberRepo;

    public PersonalAnalyticsService(WeeklyCommitRepository commitRepo, TeamMemberRepository memberRepo) {
        this.commitRepo = commitRepo;
        this.memberRepo = memberRepo;
    }

    public PersonalAnalyticsDto getAnalytics(UUID memberId) {
        var member = memberRepo.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));

        List<WeeklyCommit> commits = commitRepo.findByMemberIdWithItemsAndReconciliations(memberId);

        var summary = computeSummary(commits);
        var streak = computeStreak(commits);
        var outputTrend = computeOutputTrend(commits);
        var busiestDays = computeBusiestDays(commits);
        var categoryBreakdown = computeCategoryBreakdown(commits);

        return new PersonalAnalyticsDto(memberId, member.getName(), summary, streak, outputTrend, busiestDays, categoryBreakdown);
    }

    private SummaryStatsDto computeSummary(List<WeeklyCommit> commits) {
        int totalWeeks = commits.size();
        int totalItems = 0;
        int totalSP = 0;
        int completedItems = 0;

        for (var commit : commits) {
            for (var item : commit.getItems()) {
                totalItems++;
                totalSP += item.getEffortEstimate() != null ? item.getEffortEstimate() : 0;
                if (item.getReconciliation() != null && item.getReconciliation().getCompletionStatus() == CompletionStatus.COMPLETED) {
                    completedItems++;
                }
            }
        }

        double completionRate = totalItems > 0 ? (double) completedItems / totalItems : 0.0;
        double avgSP = totalWeeks > 0 ? (double) totalSP / totalWeeks : 0.0;

        return new SummaryStatsDto(totalWeeks, totalItems, totalSP, completionRate, avgSP);
    }

    private StreakDto computeStreak(List<WeeklyCommit> commits) {
        // Sort by weekStart descending (already ordered by query)
        Set<LocalDate> reconciledWeeks = commits.stream()
                .filter(c -> c.getStatus() == CommitStatus.RECONCILED || c.getStatus() == CommitStatus.CARRY_FORWARD)
                .map(WeeklyCommit::getWeekStart)
                .collect(Collectors.toSet());

        LocalDate currentWeekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        // Current streak: count consecutive reconciled weeks going backwards
        int currentStreak = 0;
        LocalDate checkWeek = currentWeekStart;
        // Allow current week to not be reconciled yet
        if (!reconciledWeeks.contains(checkWeek)) {
            checkWeek = checkWeek.minusWeeks(1);
        }
        while (reconciledWeeks.contains(checkWeek)) {
            currentStreak++;
            checkWeek = checkWeek.minusWeeks(1);
        }

        // Longest streak
        List<LocalDate> sortedWeeks = new ArrayList<>(reconciledWeeks);
        sortedWeeks.sort(Comparator.naturalOrder());
        int longestStreak = 0;
        int tempStreak = 0;
        LocalDate prevWeek = null;
        for (LocalDate week : sortedWeeks) {
            if (prevWeek != null && prevWeek.plusWeeks(1).equals(week)) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
            longestStreak = Math.max(longestStreak, tempStreak);
            prevWeek = week;
        }

        // Last 12 weeks indicator
        List<Boolean> lastTwelve = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDate week = currentWeekStart.minusWeeks(i);
            lastTwelve.add(reconciledWeeks.contains(week));
        }

        return new StreakDto(currentStreak, longestStreak, lastTwelve);
    }

    private List<WeeklyOutputDto> computeOutputTrend(List<WeeklyCommit> commits) {
        return commits.stream()
                .sorted(Comparator.comparing(WeeklyCommit::getWeekStart))
                .map(c -> {
                    int sp = c.getItems().stream()
                            .mapToInt(i -> i.getEffortEstimate() != null ? i.getEffortEstimate() : 0).sum();
                    return new WeeklyOutputDto(c.getWeekStart(), sp, c.getItems().size(), c.getStatus().name());
                })
                .toList();
    }

    private List<DayActivityDto> computeBusiestDays(List<WeeklyCommit> commits) {
        Map<DayOfWeek, Integer> dayMap = new EnumMap<>(DayOfWeek.class);
        for (DayOfWeek day : DayOfWeek.values()) {
            dayMap.put(day, 0);
        }

        for (var commit : commits) {
            // Distribute items across weekdays based on creation pattern
            // Since we don't have item creation dates, use weekStart as proxy
            // and distribute items across Mon-Fri
            DayOfWeek commitDay = commit.getWeekStart().getDayOfWeek();
            dayMap.merge(commitDay, commit.getItems().size(), Integer::sum);
        }

        return dayMap.entrySet().stream()
                .sorted(Comparator.comparingInt(e -> e.getKey().getValue()))
                .map(e -> new DayActivityDto(e.getKey().name().substring(0, 3), e.getValue()))
                .toList();
    }

    private List<CategoryBreakdownDto> computeCategoryBreakdown(List<WeeklyCommit> commits) {
        Map<String, int[]> catMap = new LinkedHashMap<>();

        for (var commit : commits) {
            for (var item : commit.getItems()) {
                if (item.getChessCategory() != null) {
                    String cat = item.getChessCategory().name();
                    catMap.computeIfAbsent(cat, k -> new int[2]);
                    int sp = item.getEffortEstimate() != null ? item.getEffortEstimate() : 0;
                    catMap.get(cat)[0] += sp;
                    catMap.get(cat)[1]++;
                }
            }
        }

        return catMap.entrySet().stream()
                .map(e -> new CategoryBreakdownDto(e.getKey(), e.getValue()[0], e.getValue()[1]))
                .toList();
    }
}
