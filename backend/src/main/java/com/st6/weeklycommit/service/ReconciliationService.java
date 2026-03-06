package com.st6.weeklycommit.service;

import com.st6.weeklycommit.model.dto.ReconciliationDto;
import com.st6.weeklycommit.model.dto.UpdateReconciliationRequest;
import com.st6.weeklycommit.model.entity.CommitStatus;
import com.st6.weeklycommit.model.entity.Reconciliation;
import com.st6.weeklycommit.repository.CommitItemRepository;
import com.st6.weeklycommit.repository.ReconciliationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ReconciliationService {

    private final ReconciliationRepository reconciliationRepo;
    private final CommitItemRepository itemRepo;

    public ReconciliationService(ReconciliationRepository reconciliationRepo, CommitItemRepository itemRepo) {
        this.reconciliationRepo = reconciliationRepo;
        this.itemRepo = itemRepo;
    }

    @Transactional
    public ReconciliationDto upsertReconciliation(UUID commitItemId, UpdateReconciliationRequest req) {
        var item = itemRepo.findById(commitItemId).orElseThrow(() -> new IllegalArgumentException("Commit item not found: " + commitItemId));
        if (item.getWeeklyCommit().getStatus() != CommitStatus.RECONCILING) {
            throw new IllegalStateException("Can only reconcile items in RECONCILING commits");
        }
        var recon = reconciliationRepo.findByCommitItemId(commitItemId).orElseGet(() -> {
            var r = new Reconciliation();
            r.setCommitItem(item);
            return r;
        });
        recon.setCompletionStatus(req.completionStatus());
        recon.setNotes(req.notes());
        recon.setActualStoryPoints(req.actualStoryPoints());
        var saved = reconciliationRepo.save(recon);
        return new ReconciliationDto(saved.getId(), commitItemId, saved.getCompletionStatus(), saved.getNotes(), saved.getActualStoryPoints());
    }
}
