package com.st6.weeklycommit.service;

import com.st6.weeklycommit.model.dto.CreateCommitItemRequest;
import com.st6.weeklycommit.model.dto.CreateWeeklyCommitRequest;
import com.st6.weeklycommit.model.dto.UpdateCommitItemRequest;
import com.st6.weeklycommit.model.dto.UpdateItemRiskRequest;
import com.st6.weeklycommit.model.entity.*;
import com.st6.weeklycommit.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommitServiceTest {

    @Mock private WeeklyCommitRepository commitRepo;
    @Mock private TeamMemberRepository memberRepo;
    @Mock private CommitItemRepository itemRepo;
    @Mock private OutcomeRepository outcomeRepo;

    @InjectMocks
    private CommitService commitService;

    private TeamMember member;
    private Team team;
    private WeeklyCommit commit;

    @BeforeEach
    void setUp() {
        team = new Team();
        team.setId(UUID.randomUUID());
        team.setName("Test Team");

        member = new TeamMember();
        member.setId(UUID.randomUUID());
        member.setTeam(team);
        member.setName("Test User");
        member.setEmail("test@example.com");

        commit = new WeeklyCommit();
        commit.setId(UUID.randomUUID());
        commit.setTeamMember(member);
        commit.setWeekStart(LocalDate.of(2026, 3, 2));
        commit.setStatus(CommitStatus.DRAFT);
        commit.setItems(new ArrayList<>());
    }

    @Test
    void createCommit() {
        var req = new CreateWeeklyCommitRequest(member.getId(), LocalDate.of(2026, 3, 2));
        when(memberRepo.findById(member.getId())).thenReturn(Optional.of(member));
        when(commitRepo.findByTeamMemberIdAndWeekStart(member.getId(), req.weekStart())).thenReturn(Optional.empty());
        when(commitRepo.save(any())).thenAnswer(inv -> {
            WeeklyCommit wc = inv.getArgument(0);
            wc.setId(UUID.randomUUID());
            return wc;
        });

        var result = commitService.createCommit(req);
        assertNotNull(result.id());
        assertEquals(member.getName(), result.teamMemberName());
    }

    @Test
    void createCommitDuplicateThrows() {
        var req = new CreateWeeklyCommitRequest(member.getId(), LocalDate.of(2026, 3, 2));
        when(memberRepo.findById(member.getId())).thenReturn(Optional.of(member));
        when(commitRepo.findByTeamMemberIdAndWeekStart(member.getId(), req.weekStart())).thenReturn(Optional.of(commit));

        assertThrows(IllegalStateException.class, () -> commitService.createCommit(req));
    }

    @Test
    void createCommitMemberNotFound() {
        var req = new CreateWeeklyCommitRequest(UUID.randomUUID(), LocalDate.of(2026, 3, 2));
        when(memberRepo.findById(req.teamMemberId())).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> commitService.createCommit(req));
    }

    @Test
    void createItem() {
        when(commitRepo.findById(commit.getId())).thenReturn(Optional.of(commit));
        when(itemRepo.save(any())).thenAnswer(inv -> {
            CommitItem item = inv.getArgument(0);
            item.setId(UUID.randomUUID());
            return item;
        });
        var req = new CreateCommitItemRequest(null, "Test Item", null, ChessCategory.STRATEGIC, 3, 4, 0);
        var result = commitService.createItem(commit.getId(), req);
        assertEquals("Test Item", result.title());
    }

    @Test
    void createItemOnLockedCommitThrows() {
        commit.setStatus(CommitStatus.LOCKED);
        when(commitRepo.findById(commit.getId())).thenReturn(Optional.of(commit));
        var req = new CreateCommitItemRequest(null, "Test", null, null, null, null, 0);
        assertThrows(IllegalStateException.class, () -> commitService.createItem(commit.getId(), req));
    }

    @Test
    void updateItem() {
        var item = new CommitItem();
        item.setId(UUID.randomUUID());
        item.setWeeklyCommit(commit);
        item.setTitle("Old Title");

        when(commitRepo.findById(commit.getId())).thenReturn(Optional.of(commit));
        when(itemRepo.findById(item.getId())).thenReturn(Optional.of(item));
        when(itemRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var req = new UpdateCommitItemRequest(null, "New Title", "desc", ChessCategory.TACTICAL, 2, 4, 1);
        var result = commitService.updateItem(commit.getId(), item.getId(), req);
        assertEquals("New Title", result.title());
    }

    @Test
    void updateItemOnLockedCommitThrows() {
        commit.setStatus(CommitStatus.LOCKED);
        when(commitRepo.findById(commit.getId())).thenReturn(Optional.of(commit));
        var req = new UpdateCommitItemRequest(null, "Title", null, null, null, null, 0);
        assertThrows(IllegalStateException.class, () -> commitService.updateItem(commit.getId(), UUID.randomUUID(), req));
    }

    @Test
    void updateItemWrongCommitThrows() {
        var item = new CommitItem();
        item.setId(UUID.randomUUID());
        var otherCommit = new WeeklyCommit();
        otherCommit.setId(UUID.randomUUID());
        item.setWeeklyCommit(otherCommit);

        when(commitRepo.findById(commit.getId())).thenReturn(Optional.of(commit));
        when(itemRepo.findById(item.getId())).thenReturn(Optional.of(item));

        var req = new UpdateCommitItemRequest(null, "Title", null, null, null, null, 0);
        assertThrows(IllegalArgumentException.class, () -> commitService.updateItem(commit.getId(), item.getId(), req));
    }

    @Test
    void deleteItem() {
        var item = new CommitItem();
        item.setId(UUID.randomUUID());
        item.setWeeklyCommit(commit);

        when(commitRepo.findById(commit.getId())).thenReturn(Optional.of(commit));
        when(itemRepo.findById(item.getId())).thenReturn(Optional.of(item));

        assertDoesNotThrow(() -> commitService.deleteItem(commit.getId(), item.getId()));
        verify(itemRepo).delete(item);
    }

    @Test
    void deleteItemOnLockedCommitThrows() {
        commit.setStatus(CommitStatus.LOCKED);
        when(commitRepo.findById(commit.getId())).thenReturn(Optional.of(commit));
        assertThrows(IllegalStateException.class, () -> commitService.deleteItem(commit.getId(), UUID.randomUUID()));
    }

    @Test
    void deleteItemNotFoundThrows() {
        when(commitRepo.findById(commit.getId())).thenReturn(Optional.of(commit));
        when(itemRepo.findById(any())).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> commitService.deleteItem(commit.getId(), UUID.randomUUID()));
    }

    @Test
    void deleteItemWrongCommitThrows() {
        var item = new CommitItem();
        item.setId(UUID.randomUUID());
        var otherCommit = new WeeklyCommit();
        otherCommit.setId(UUID.randomUUID());
        item.setWeeklyCommit(otherCommit);

        when(commitRepo.findById(commit.getId())).thenReturn(Optional.of(commit));
        when(itemRepo.findById(item.getId())).thenReturn(Optional.of(item));
        assertThrows(IllegalArgumentException.class, () -> commitService.deleteItem(commit.getId(), item.getId()));
    }

    @Test
    void getCommitNotFound() {
        when(commitRepo.findById(any())).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> commitService.getCommit(UUID.randomUUID()));
    }

    @Test
    void updateItemClearsStaleFlagOnEdit() {
        var item = new CommitItem();
        item.setId(UUID.randomUUID());
        item.setWeeklyCommit(commit);
        item.setTitle("Stale Task");
        item.setFlaggedStale(true);
        item.setCarryForwardCount(3);

        when(commitRepo.findById(commit.getId())).thenReturn(Optional.of(commit));
        when(itemRepo.findById(item.getId())).thenReturn(Optional.of(item));
        when(itemRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var req = new UpdateCommitItemRequest(null, "Resized Task", null, ChessCategory.STRATEGIC, 5, 3, 1);
        commitService.updateItem(commit.getId(), item.getId(), req);
        assertFalse(item.isFlaggedStale());
    }

    @Test
    void updateItemRiskOnLockedCommit() {
        commit.setStatus(CommitStatus.LOCKED);
        var item = new CommitItem();
        item.setId(UUID.randomUUID());
        item.setWeeklyCommit(commit);
        item.setTitle("Blocked Task");

        when(commitRepo.findById(commit.getId())).thenReturn(Optional.of(commit));
        when(itemRepo.findById(item.getId())).thenReturn(Optional.of(item));
        when(itemRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var req = new UpdateItemRiskRequest(RiskFlag.BLOCKED, "Waiting on API team");
        var result = commitService.updateItemRisk(commit.getId(), item.getId(), req);
        assertEquals("BLOCKED", result.riskFlag());
        assertEquals("Waiting on API team", result.riskNote());
        assertNotNull(result.riskFlaggedAt());
    }

    @Test
    void updateItemRiskOnDraftThrows() {
        when(commitRepo.findById(commit.getId())).thenReturn(Optional.of(commit));
        var req = new UpdateItemRiskRequest(RiskFlag.BLOCKED, null);
        assertThrows(IllegalStateException.class, () -> commitService.updateItemRisk(commit.getId(), UUID.randomUUID(), req));
    }

    @Test
    void clearItemRiskFlag() {
        commit.setStatus(CommitStatus.LOCKED);
        var item = new CommitItem();
        item.setId(UUID.randomUUID());
        item.setWeeklyCommit(commit);
        item.setTitle("Previously Blocked");
        item.setRiskFlag("BLOCKED");
        item.setRiskNote("old reason");
        item.setRiskFlaggedAt(java.time.Instant.now());

        when(commitRepo.findById(commit.getId())).thenReturn(Optional.of(commit));
        when(itemRepo.findById(item.getId())).thenReturn(Optional.of(item));
        when(itemRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var req = new UpdateItemRiskRequest(null, null);
        var result = commitService.updateItemRisk(commit.getId(), item.getId(), req);
        assertNull(result.riskFlag());
        assertNull(result.riskNote());
        assertNull(result.riskFlaggedAt());
    }
}
