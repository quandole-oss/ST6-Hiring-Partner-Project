package com.st6.weeklycommit.repository;

import com.st6.weeklycommit.model.entity.CommitStatus;
import com.st6.weeklycommit.model.entity.WeeklyCommit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WeeklyCommitRepository extends JpaRepository<WeeklyCommit, UUID> {
    List<WeeklyCommit> findByTeamMemberId(UUID teamMemberId);
    Optional<WeeklyCommit> findByTeamMemberIdAndWeekStart(UUID teamMemberId, LocalDate weekStart);
    List<WeeklyCommit> findByStatus(CommitStatus status);

    @Query("SELECT wc FROM WeeklyCommit wc WHERE wc.teamMember.team.id = :teamId AND wc.weekStart = :weekStart")
    List<WeeklyCommit> findByTeamIdAndWeekStart(UUID teamId, LocalDate weekStart);

    List<WeeklyCommit> findByStatusAndWeekStartBefore(CommitStatus status, LocalDate date);
}
