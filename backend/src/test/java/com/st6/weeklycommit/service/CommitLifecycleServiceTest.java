package com.st6.weeklycommit.service;

import com.st6.weeklycommit.model.entity.CommitItem;
import com.st6.weeklycommit.model.entity.CommitStatus;
import com.st6.weeklycommit.model.entity.WeeklyCommit;
import com.st6.weeklycommit.repository.AuditLogRepository;
import com.st6.weeklycommit.repository.WeeklyCommitRepository;
import com.st6.weeklycommit.statemachine.CommitLifecycleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommitLifecycleServiceTest {

    @Mock
    private WeeklyCommitRepository commitRepo;

    @Mock
    private AuditLogRepository auditLogRepo;

    @InjectMocks
    private CommitLifecycleService lifecycleService;

    private WeeklyCommit commit;

    @BeforeEach
    void setUp() {
        commit = new WeeklyCommit();
        commit.setId(UUID.randomUUID());
        commit.setStatus(CommitStatus.DRAFT);
        lenient().when(commitRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void draftToLocked() {
        var result = lifecycleService.transition(commit, CommitStatus.LOCKED);
        assertEquals(CommitStatus.LOCKED, result.getStatus());
        assertNotNull(result.getLockedAt());
        verify(auditLogRepo).save(any());
    }

    @Test
    void lockedToReconciling() {
        commit.setStatus(CommitStatus.LOCKED);
        var result = lifecycleService.transition(commit, CommitStatus.RECONCILING);
        assertEquals(CommitStatus.RECONCILING, result.getStatus());
    }

    @Test
    void reconcilingToReconciled() {
        commit.setStatus(CommitStatus.RECONCILING);
        var result = lifecycleService.transition(commit, CommitStatus.RECONCILED);
        assertEquals(CommitStatus.RECONCILED, result.getStatus());
        assertNotNull(result.getReconciledAt());
    }

    @Test
    void reconciledToCarryForward() {
        commit.setStatus(CommitStatus.RECONCILED);
        var result = lifecycleService.transition(commit, CommitStatus.CARRY_FORWARD);
        assertEquals(CommitStatus.CARRY_FORWARD, result.getStatus());
    }

    @Test
    void invalidTransitionDraftToReconciling() {
        assertThrows(IllegalStateException.class, () -> lifecycleService.transition(commit, CommitStatus.RECONCILING));
    }

    @Test
    void invalidTransitionLockedToDraft() {
        commit.setStatus(CommitStatus.LOCKED);
        assertThrows(IllegalStateException.class, () -> lifecycleService.transition(commit, CommitStatus.DRAFT));
    }

    @Test
    void invalidTransitionReconciledToDraft() {
        commit.setStatus(CommitStatus.RECONCILED);
        assertThrows(IllegalStateException.class, () -> lifecycleService.transition(commit, CommitStatus.DRAFT));
    }

    @Test
    void carryForwardIsTerminal() {
        commit.setStatus(CommitStatus.CARRY_FORWARD);
        assertThrows(IllegalStateException.class, () -> lifecycleService.transition(commit, CommitStatus.DRAFT));
        assertThrows(IllegalStateException.class, () -> lifecycleService.transition(commit, CommitStatus.LOCKED));
    }

    @Test
    void transitionByIdNotFound() {
        when(commitRepo.findById(any())).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> lifecycleService.transition(UUID.randomUUID(), CommitStatus.LOCKED));
    }

    @Test
    void lockBlockedByMissingStoryPoints() {
        var item = new CommitItem();
        item.setId(UUID.randomUUID());
        item.setWeeklyCommit(commit);
        item.setTitle("No SP");
        item.setEffortEstimate(null);
        commit.getItems().add(item);

        var ex = assertThrows(IllegalStateException.class, () -> lifecycleService.transition(commit, CommitStatus.LOCKED));
        assertTrue(ex.getMessage().contains("story points"));
    }

    @Test
    void lockBlockedByStaleItems() {
        var item = new CommitItem();
        item.setId(UUID.randomUUID());
        item.setWeeklyCommit(commit);
        item.setTitle("Stale Item");
        item.setEffortEstimate(3);
        item.setFlaggedStale(true);
        commit.getItems().add(item);

        var ex = assertThrows(IllegalStateException.class, () -> lifecycleService.transition(commit, CommitStatus.LOCKED));
        assertTrue(ex.getMessage().contains("stale"));
    }

    @Test
    void overrideTransitionNonStandard() {
        commit.setStatus(CommitStatus.LOCKED);
        var result = lifecycleService.overrideTransition(commit, CommitStatus.DRAFT, "MANAGER", "Reopening for edits");
        assertEquals(CommitStatus.DRAFT, result.getStatus());
        verify(auditLogRepo).save(argThat(audit -> audit.isManualOverride() && "MANAGER".equals(audit.getTriggeredBy())));
    }

    @Test
    void overrideTransitionStandardPath() {
        var result = lifecycleService.overrideTransition(commit, CommitStatus.LOCKED, "MANAGER", null);
        assertEquals(CommitStatus.LOCKED, result.getStatus());
        verify(auditLogRepo).save(argThat(audit -> !audit.isManualOverride()));
    }
}
