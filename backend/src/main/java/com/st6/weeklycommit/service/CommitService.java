package com.st6.weeklycommit.service;

import com.st6.weeklycommit.model.dto.*;
import com.st6.weeklycommit.model.entity.*;
import com.st6.weeklycommit.repository.*;
import com.st6.weeklycommit.statemachine.CommitLifecycleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CommitService {

    private final WeeklyCommitRepository commitRepo;
    private final TeamMemberRepository memberRepo;
    private final CommitItemRepository itemRepo;
    private final OutcomeRepository outcomeRepo;
    private final CommitLifecycleService lifecycleService;

    public CommitService(WeeklyCommitRepository commitRepo, TeamMemberRepository memberRepo, CommitItemRepository itemRepo, OutcomeRepository outcomeRepo, CommitLifecycleService lifecycleService) {
        this.commitRepo = commitRepo;
        this.memberRepo = memberRepo;
        this.itemRepo = itemRepo;
        this.outcomeRepo = outcomeRepo;
        this.lifecycleService = lifecycleService;
    }

    public List<WeeklyCommitDto> listCommits(UUID teamMemberId) {
        return commitRepo.findByTeamMemberId(teamMemberId).stream().map(this::toDto).toList();
    }

    public WeeklyCommitDto getCommit(UUID id) {
        return toDto(findCommit(id));
    }

    @Transactional
    public WeeklyCommitDto createCommit(CreateWeeklyCommitRequest req) {
        var member = memberRepo.findById(req.teamMemberId()).orElseThrow(() -> new IllegalArgumentException("Team member not found: " + req.teamMemberId()));
        commitRepo.findByTeamMemberIdAndWeekStart(req.teamMemberId(), req.weekStart()).ifPresent(existing -> {
            throw new IllegalStateException("Commit already exists for this member and week");
        });
        var commit = new WeeklyCommit();
        commit.setTeamMember(member);
        commit.setWeekStart(req.weekStart());
        return toDto(commitRepo.save(commit));
    }

    public List<CommitItemDto> listItems(UUID commitId) {
        return itemRepo.findByWeeklyCommitIdOrderBySortOrderAsc(commitId).stream().map(this::toItemDto).toList();
    }

    @Transactional
    public CommitItemDto createItem(UUID commitId, CreateCommitItemRequest req) {
        var commit = findCommit(commitId);
        if (commit.getStatus() != CommitStatus.DRAFT) {
            throw new IllegalStateException("Can only add items to DRAFT commits");
        }
        var item = new CommitItem();
        item.setWeeklyCommit(commit);
        item.setTitle(req.title());
        item.setDescription(req.description());
        item.setChessCategory(req.chessCategory());
        item.setEffortEstimate(req.effortEstimate());
        item.setImpactEstimate(req.impactEstimate());
        item.setSortOrder(req.sortOrder());
        if (req.outcomeId() != null) {
            var outcome = outcomeRepo.findById(req.outcomeId()).orElseThrow(() -> new IllegalArgumentException("Outcome not found: " + req.outcomeId()));
            item.setOutcome(outcome);
        }
        return toItemDto(itemRepo.save(item));
    }

    @Transactional
    public CommitItemDto updateItem(UUID commitId, UUID itemId, UpdateCommitItemRequest req) {
        var commit = findCommit(commitId);
        if (commit.getStatus() != CommitStatus.DRAFT) {
            throw new IllegalStateException("Can only update items in DRAFT commits");
        }
        var item = itemRepo.findById(itemId).orElseThrow(() -> new IllegalArgumentException("Commit item not found: " + itemId));
        if (!item.getWeeklyCommit().getId().equals(commitId)) {
            throw new IllegalArgumentException("Item does not belong to commit: " + commitId);
        }
        item.setTitle(req.title());
        item.setDescription(req.description());
        item.setChessCategory(req.chessCategory());
        item.setEffortEstimate(req.effortEstimate());
        item.setImpactEstimate(req.impactEstimate());
        item.setSortOrder(req.sortOrder());
        if (item.isFlaggedStale()) {
            item.setFlaggedStale(false);
        }
        if (req.outcomeId() != null) {
            var outcome = outcomeRepo.findById(req.outcomeId()).orElseThrow(() -> new IllegalArgumentException("Outcome not found: " + req.outcomeId()));
            item.setOutcome(outcome);
        } else {
            item.setOutcome(null);
        }
        return toItemDto(itemRepo.save(item));
    }

    @Transactional
    public void deleteItem(UUID commitId, UUID itemId) {
        var commit = findCommit(commitId);
        if (commit.getStatus() != CommitStatus.DRAFT) {
            throw new IllegalStateException("Can only delete items from DRAFT commits");
        }
        var item = itemRepo.findById(itemId).orElseThrow(() -> new IllegalArgumentException("Commit item not found: " + itemId));
        if (!item.getWeeklyCommit().getId().equals(commitId)) {
            throw new IllegalArgumentException("Item does not belong to commit: " + commitId);
        }
        itemRepo.delete(item);
    }

    @Transactional
    public WeeklyCommitDto updateCommit(UUID id, CreateWeeklyCommitRequest req) {
        var commit = findCommit(id);
        if (commit.getStatus() != CommitStatus.DRAFT) {
            throw new IllegalStateException("Can only update DRAFT commits");
        }
        commit.setWeekStart(req.weekStart());
        return toDto(commitRepo.save(commit));
    }

    public WeeklyCommit findCommit(UUID id) {
        return commitRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Weekly commit not found: " + id));
    }

    @Transactional
    public CommitItemDto updateItemCategory(UUID commitId, UUID itemId, PatchItemCategoryRequest req, String triggeredBy) {
        var commit = findCommit(commitId);
        if (commit.getStatus() == CommitStatus.RECONCILED || commit.getStatus() == CommitStatus.CARRY_FORWARD) {
            throw new IllegalStateException("Cannot update category on finalized commits");
        }
        var item = itemRepo.findById(itemId)
            .orElseThrow(() -> new IllegalArgumentException("Commit item not found: " + itemId));
        if (!item.getWeeklyCommit().getId().equals(commitId)) {
            throw new IllegalArgumentException("Item does not belong to commit: " + commitId);
        }
        String oldCategory = item.getChessCategory() != null ? item.getChessCategory().name() : null;
        item.setChessCategory(req.chessCategory());
        var saved = itemRepo.save(item);
        lifecycleService.logItemChange(commit, saved, "CATEGORY_CHANGE", oldCategory, req.chessCategory().name(), triggeredBy);
        return toItemDto(saved);
    }

    @Transactional
    public CommitItemDto updateItemRisk(UUID commitId, UUID itemId, UpdateItemRiskRequest req) {
        var commit = findCommit(commitId);
        if (commit.getStatus() != CommitStatus.LOCKED) {
            throw new IllegalStateException("Can only flag risk on LOCKED commits");
        }
        var item = itemRepo.findById(itemId).orElseThrow(() -> new IllegalArgumentException("Commit item not found: " + itemId));
        if (!item.getWeeklyCommit().getId().equals(commitId)) {
            throw new IllegalArgumentException("Item does not belong to commit: " + commitId);
        }
        if (req.riskFlag() != null) {
            item.setRiskFlag(req.riskFlag().name());
            item.setRiskNote(req.riskNote());
            item.setRiskFlaggedAt(java.time.Instant.now());
        } else {
            item.setRiskFlag(null);
            item.setRiskNote(null);
            item.setRiskFlaggedAt(null);
        }
        return toItemDto(itemRepo.save(item));
    }

    public List<CommitItemDto> getItemsByOutcome(UUID outcomeId) {
        return itemRepo.findByOutcomeId(outcomeId).stream().map(this::toItemDto).toList();
    }

    WeeklyCommitDto toDto(WeeklyCommit wc) {
        var items = wc.getItems().stream().map(this::toItemDto).toList();
        boolean hasBlocked = wc.getItems().stream().anyMatch(i -> "BLOCKED".equals(i.getRiskFlag()));
        return new WeeklyCommitDto(wc.getId(), wc.getTeamMember().getId(), wc.getTeamMember().getName(), wc.getWeekStart(), wc.getStatus(), wc.getLockedAt(), wc.getReconciledAt(), items, hasBlocked);
    }

    CommitItemDto toItemDto(CommitItem item) {
        ReconciliationDto reconDto = null;
        if (item.getReconciliation() != null) {
            var r = item.getReconciliation();
            reconDto = new ReconciliationDto(r.getId(), item.getId(), r.getCompletionStatus(), r.getNotes(), r.getActualStoryPoints());
        }
        return new CommitItemDto(item.getId(), item.getWeeklyCommit().getId(), item.getOutcome() != null ? item.getOutcome().getId() : null, item.getOutcome() != null ? item.getOutcome().getTitle() : null, item.getTitle(), item.getDescription(), item.getChessCategory(), item.getEffortEstimate(), item.getImpactEstimate(), item.getSortOrder(), reconDto, item.getCarryForwardCount(), item.isFlaggedStale(), item.getRiskFlag(), item.getRiskNote(), item.getRiskFlaggedAt());
    }
}
