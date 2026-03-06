package com.st6.weeklycommit.statemachine;

import com.st6.weeklycommit.model.dto.AuditLogDto;
import com.st6.weeklycommit.model.entity.AuditLog;
import com.st6.weeklycommit.model.entity.CommitItem;
import com.st6.weeklycommit.model.entity.CommitStatus;
import com.st6.weeklycommit.model.entity.WeeklyCommit;
import com.st6.weeklycommit.repository.AuditLogRepository;
import com.st6.weeklycommit.repository.WeeklyCommitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class CommitLifecycleService {

    private static final Map<CommitStatus, Set<CommitStatus>> TRANSITIONS = Map.of(
            CommitStatus.DRAFT, Set.of(CommitStatus.LOCKED),
            CommitStatus.LOCKED, Set.of(CommitStatus.RECONCILING),
            CommitStatus.RECONCILING, Set.of(CommitStatus.RECONCILED),
            CommitStatus.RECONCILED, Set.of(CommitStatus.CARRY_FORWARD),
            CommitStatus.CARRY_FORWARD, Set.of()
    );

    private final WeeklyCommitRepository commitRepo;
    private final AuditLogRepository auditLogRepo;

    public CommitLifecycleService(WeeklyCommitRepository commitRepo, AuditLogRepository auditLogRepo) {
        this.commitRepo = commitRepo;
        this.auditLogRepo = auditLogRepo;
    }

    @Transactional
    public WeeklyCommit transition(UUID commitId, CommitStatus targetStatus) {
        var commit = commitRepo.findById(commitId).orElseThrow(() -> new IllegalArgumentException("Commit not found: " + commitId));
        return transition(commit, targetStatus);
    }

    @Transactional
    public WeeklyCommit transition(UUID commitId, CommitStatus targetStatus, String triggeredBy) {
        var commit = commitRepo.findById(commitId).orElseThrow(() -> new IllegalArgumentException("Commit not found: " + commitId));
        return transition(commit, targetStatus, triggeredBy);
    }

    @Transactional
    public WeeklyCommit overrideTransition(UUID commitId, CommitStatus targetStatus, String triggeredBy, String notes) {
        var commit = commitRepo.findById(commitId).orElseThrow(() -> new IllegalArgumentException("Commit not found: " + commitId));
        return overrideTransition(commit, targetStatus, triggeredBy, notes);
    }

    @Transactional
    public WeeklyCommit transition(WeeklyCommit commit, CommitStatus targetStatus) {
        return transition(commit, targetStatus, "SYSTEM");
    }

    @Transactional
    public WeeklyCommit transition(WeeklyCommit commit, CommitStatus targetStatus, String triggeredBy) {
        var previousState = commit.getStatus();
        var allowed = TRANSITIONS.getOrDefault(previousState, Set.of());
        boolean isStandardTransition = allowed.contains(targetStatus);

        if (!isStandardTransition) {
            throw new IllegalStateException("Invalid transition: " + previousState + " -> " + targetStatus);
        }

        if (targetStatus == CommitStatus.LOCKED) {
            boolean missingStoryPoints = commit.getItems().stream()
                    .anyMatch(item -> item.getEffortEstimate() == null);
            if (missingStoryPoints) {
                throw new IllegalStateException("All items must have story points assigned before locking");
            }
            boolean hasStaleItems = commit.getItems().stream()
                    .anyMatch(item -> item.isFlaggedStale());
            if (hasStaleItems) {
                throw new IllegalStateException("Resolve stale carry-forward items before locking");
            }
        }

        commit.setStatus(targetStatus);
        if (targetStatus == CommitStatus.LOCKED) {
            commit.setLockedAt(Instant.now());
        } else if (targetStatus == CommitStatus.RECONCILED) {
            commit.setReconciledAt(Instant.now());
        }

        var saved = commitRepo.save(commit);
        createAuditEntry(saved, previousState, targetStatus, triggeredBy, false, null);
        return saved;
    }

    @Transactional
    public WeeklyCommit overrideTransition(WeeklyCommit commit, CommitStatus targetStatus, String triggeredBy, String notes) {
        var previousState = commit.getStatus();
        var allowed = TRANSITIONS.getOrDefault(previousState, Set.of());
        boolean isStandardTransition = allowed.contains(targetStatus);

        commit.setStatus(targetStatus);
        if (targetStatus == CommitStatus.LOCKED) {
            commit.setLockedAt(Instant.now());
        } else if (targetStatus == CommitStatus.RECONCILED) {
            commit.setReconciledAt(Instant.now());
        }

        var saved = commitRepo.save(commit);
        createAuditEntry(saved, previousState, targetStatus, triggeredBy, !isStandardTransition, notes);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getAuditLog(UUID commitId) {
        return auditLogRepo.findByWeeklyCommitIdOrderByCreatedAtDesc(commitId).stream()
                .map(a -> new AuditLogDto(
                        a.getId(),
                        a.getWeeklyCommit().getId(),
                        a.getPreviousState(),
                        a.getNewState(),
                        a.getTriggeredBy(),
                        a.isManualOverride(),
                        a.getNotes(),
                        a.getCreatedAt(),
                        a.getCommitItem() != null ? a.getCommitItem().getId() : null,
                        a.getCommitItem() != null ? a.getCommitItem().getTitle() : null,
                        a.getActionType(),
                        a.getOldValue(),
                        a.getNewValue()))
                .toList();
    }

    @Transactional
    public void logItemChange(WeeklyCommit commit, CommitItem item, String actionType, String oldValue, String newValue, String triggeredBy) {
        var audit = new AuditLog();
        audit.setWeeklyCommit(commit);
        audit.setCommitItem(item);
        audit.setActionType(actionType);
        audit.setOldValue(oldValue);
        audit.setNewValue(newValue);
        audit.setTriggeredBy(triggeredBy);
        auditLogRepo.save(audit);
    }

    private void createAuditEntry(WeeklyCommit commit, CommitStatus previousState, CommitStatus newState, String triggeredBy, boolean isManualOverride, String notes) {
        var audit = new AuditLog();
        audit.setWeeklyCommit(commit);
        audit.setPreviousState(previousState);
        audit.setNewState(newState);
        audit.setTriggeredBy(triggeredBy);
        audit.setManualOverride(isManualOverride);
        audit.setNotes(notes);
        auditLogRepo.save(audit);
    }
}
