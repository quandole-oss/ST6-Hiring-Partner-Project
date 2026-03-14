package com.st6.weeklycommit.repository;

import com.st6.weeklycommit.model.entity.RetrospectiveEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RetrospectiveEntryRepository extends JpaRepository<RetrospectiveEntry, UUID> {

    List<RetrospectiveEntry> findByTeamMemberIdAndWeekStart(UUID teamMemberId, LocalDate weekStart);

    Optional<RetrospectiveEntry> findByTeamMemberIdAndWeekStartAndPromptKey(UUID teamMemberId, LocalDate weekStart, String promptKey);
}
