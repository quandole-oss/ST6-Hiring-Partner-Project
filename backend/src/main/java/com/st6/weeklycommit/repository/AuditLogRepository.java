package com.st6.weeklycommit.repository;

import com.st6.weeklycommit.model.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByWeeklyCommitIdOrderByCreatedAtDesc(UUID weeklyCommitId);
}
