package com.st6.weeklycommit.service;

import com.st6.weeklycommit.model.entity.*;
import com.st6.weeklycommit.repository.WeeklyCommitRepository;
import com.st6.weeklycommit.statemachine.CommitLifecycleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

@Component
public class ScheduledTasks {

    private static final Logger log = LoggerFactory.getLogger(ScheduledTasks.class);

    private final WeeklyCommitRepository commitRepo;
    private final CommitLifecycleService lifecycleService;

    @Value("${app.lifecycle.carry-forward-limit:3}")
    private int carryForwardLimit;

    public ScheduledTasks(WeeklyCommitRepository commitRepo, CommitLifecycleService lifecycleService) {
        this.commitRepo = commitRepo;
        this.lifecycleService = lifecycleService;
    }

    @Scheduled(cron = "${app.lifecycle.auto-lock-cron}")
    @Transactional
    public void autoLockDraftCommits() {
        LocalDate currentWeek = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        var drafts = commitRepo.findByStatusAndWeekStartBefore(CommitStatus.DRAFT, currentWeek);
        log.info("Auto-locking {} draft commits from previous weeks", drafts.size());
        for (var commit : drafts) {
            lifecycleService.transition(commit, CommitStatus.LOCKED);
        }
    }

    @Scheduled(cron = "0 0 11 * * MON")
    @Transactional
    public void carryForwardReconciledCommits() {
        LocalDate currentWeek = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        var reconciled = commitRepo.findByStatusAndWeekStartBefore(CommitStatus.RECONCILED, currentWeek);
        log.info("Carrying forward {} reconciled commits", reconciled.size());
        for (var commit : reconciled) {
            lifecycleService.transition(commit, CommitStatus.CARRY_FORWARD);
            createCarryForwardItems(commit, currentWeek);
        }
    }

    private void createCarryForwardItems(WeeklyCommit sourceCommit, LocalDate newWeekStart) {
        var deferredItems = sourceCommit.getItems().stream()
                .filter(item -> item.getReconciliation() != null &&
                        (item.getReconciliation().getCompletionStatus() == CompletionStatus.DEFERRED ||
                         item.getReconciliation().getCompletionStatus() == CompletionStatus.NOT_STARTED))
                .toList();

        if (deferredItems.isEmpty()) return;

        var existingCommit = commitRepo.findByTeamMemberIdAndWeekStart(sourceCommit.getTeamMember().getId(), newWeekStart);
        WeeklyCommit targetCommit;
        if (existingCommit.isPresent()) {
            targetCommit = existingCommit.get();
        } else {
            targetCommit = new WeeklyCommit();
            targetCommit.setTeamMember(sourceCommit.getTeamMember());
            targetCommit.setWeekStart(newWeekStart);
            targetCommit = commitRepo.save(targetCommit);
        }

        int nextSort = targetCommit.getItems().size();
        for (var item : deferredItems) {
            var newItem = new CommitItem();
            newItem.setWeeklyCommit(targetCommit);
            newItem.setOutcome(item.getOutcome());
            newItem.setTitle(item.getTitle());
            newItem.setDescription(item.getDescription());
            newItem.setChessCategory(item.getChessCategory());
            newItem.setEffortEstimate(item.getEffortEstimate());
            newItem.setImpactEstimate(item.getImpactEstimate());
            newItem.setSortOrder(nextSort++);
            int newCount = item.getCarryForwardCount() + 1;
            newItem.setCarryForwardCount(newCount);
            if (newCount >= carryForwardLimit) {
                newItem.setFlaggedStale(true);
                log.warn("Item '{}' has been carried forward {} times — flagged stale", item.getTitle(), newCount);
            }
            targetCommit.getItems().add(newItem);
        }
        commitRepo.save(targetCommit);
        log.info("Carried forward {} items for member {}", deferredItems.size(), sourceCommit.getTeamMember().getName());
    }
}
