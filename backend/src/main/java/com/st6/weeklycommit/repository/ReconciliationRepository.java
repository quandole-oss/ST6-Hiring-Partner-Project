package com.st6.weeklycommit.repository;

import com.st6.weeklycommit.model.entity.Reconciliation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ReconciliationRepository extends JpaRepository<Reconciliation, UUID> {
    Optional<Reconciliation> findByCommitItemId(UUID commitItemId);
}
