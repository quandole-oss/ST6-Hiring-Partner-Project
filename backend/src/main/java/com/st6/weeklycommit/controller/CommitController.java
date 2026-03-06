package com.st6.weeklycommit.controller;

import com.st6.weeklycommit.model.dto.*;
import com.st6.weeklycommit.model.entity.CommitStatus;
import com.st6.weeklycommit.service.CommitService;
import com.st6.weeklycommit.service.ReconciliationService;
import com.st6.weeklycommit.statemachine.CommitLifecycleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/commits")
public class CommitController {

    private final CommitService commitService;
    private final CommitLifecycleService lifecycleService;
    private final ReconciliationService reconciliationService;

    public CommitController(CommitService commitService, CommitLifecycleService lifecycleService, ReconciliationService reconciliationService) {
        this.commitService = commitService;
        this.lifecycleService = lifecycleService;
        this.reconciliationService = reconciliationService;
    }

    @GetMapping
    public List<WeeklyCommitDto> listCommits(@RequestParam UUID teamMemberId) { return commitService.listCommits(teamMemberId); }

    @GetMapping("/{id}")
    public WeeklyCommitDto getCommit(@PathVariable UUID id) { return commitService.getCommit(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WeeklyCommitDto createCommit(@Valid @RequestBody CreateWeeklyCommitRequest req) { return commitService.createCommit(req); }

    @PutMapping("/{id}")
    public WeeklyCommitDto updateCommit(@PathVariable UUID id, @Valid @RequestBody CreateWeeklyCommitRequest req) { return commitService.updateCommit(id, req); }

    @PostMapping("/{id}/lock")
    public WeeklyCommitDto lockCommit(@PathVariable UUID id) {
        var commit = lifecycleService.transition(id, CommitStatus.LOCKED, currentUserName());
        return commitService.getCommit(commit.getId());
    }

    @PostMapping("/{id}/reconcile")
    public WeeklyCommitDto startReconciliation(@PathVariable UUID id) {
        var commit = lifecycleService.transition(id, CommitStatus.RECONCILING, currentUserName());
        return commitService.getCommit(commit.getId());
    }

    @PostMapping("/{id}/submit")
    public WeeklyCommitDto submitReconciliation(@PathVariable UUID id) {
        var commit = lifecycleService.transition(id, CommitStatus.RECONCILED, currentUserName());
        return commitService.getCommit(commit.getId());
    }

    @PostMapping("/{id}/override")
    public WeeklyCommitDto overrideStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        var targetStatus = CommitStatus.valueOf(body.get("targetStatus"));
        var notes = body.get("notes");
        var commit = lifecycleService.overrideTransition(id, targetStatus, currentUserName(), notes);
        return commitService.getCommit(commit.getId());
    }

    @GetMapping("/{id}/audit-log")
    public List<AuditLogDto> getAuditLog(@PathVariable UUID id) {
        return lifecycleService.getAuditLog(id);
    }

    @GetMapping("/{id}/items")
    public List<CommitItemDto> listItems(@PathVariable UUID id) { return commitService.listItems(id); }

    @PostMapping("/{id}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public CommitItemDto createItem(@PathVariable UUID id, @Valid @RequestBody CreateCommitItemRequest req) { return commitService.createItem(id, req); }

    @PutMapping("/{commitId}/items/{itemId}")
    public CommitItemDto updateItem(@PathVariable UUID commitId, @PathVariable UUID itemId, @Valid @RequestBody UpdateCommitItemRequest req) {
        return commitService.updateItem(commitId, itemId, req);
    }

    @DeleteMapping("/{commitId}/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable UUID commitId, @PathVariable UUID itemId) { commitService.deleteItem(commitId, itemId); }

    @PutMapping("/{commitId}/items/{itemId}/reconciliation")
    public ReconciliationDto updateReconciliation(@PathVariable UUID commitId, @PathVariable UUID itemId, @Valid @RequestBody UpdateReconciliationRequest req) {
        return reconciliationService.upsertReconciliation(itemId, req);
    }

    @PatchMapping("/{commitId}/items/{itemId}/category")
    public CommitItemDto updateItemCategory(@PathVariable UUID commitId, @PathVariable UUID itemId, @Valid @RequestBody PatchItemCategoryRequest req) {
        return commitService.updateItemCategory(commitId, itemId, req, currentUserName());
    }

    @PutMapping("/{commitId}/items/{itemId}/risk")
    public CommitItemDto updateItemRisk(@PathVariable UUID commitId, @PathVariable UUID itemId, @RequestBody UpdateItemRiskRequest req) {
        return commitService.updateItemRisk(commitId, itemId, req);
    }

    private String currentUserName() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "ANONYMOUS";
    }
}
