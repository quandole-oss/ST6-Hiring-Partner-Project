package com.st6.weeklycommit.repository;

import com.st6.weeklycommit.model.entity.CommitItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CommitItemRepository extends JpaRepository<CommitItem, UUID> {
    List<CommitItem> findByWeeklyCommitIdOrderBySortOrderAsc(UUID weeklyCommitId);
    List<CommitItem> findByOutcomeId(UUID outcomeId);
}
