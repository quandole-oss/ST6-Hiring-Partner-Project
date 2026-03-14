package com.st6.weeklycommit.repository;

import com.st6.weeklycommit.model.entity.HighFive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HighFiveRepository extends JpaRepository<HighFive, UUID> {

    List<HighFive> findByWeekStart(LocalDate weekStart);

    Optional<HighFive> findByGiverIdAndReceiverTeamIdAndWeekStart(UUID giverId, UUID receiverTeamId, LocalDate weekStart);

    @Query("SELECT h FROM HighFive h LEFT JOIN FETCH h.giver g LEFT JOIN FETCH h.receiverTeam " +
           "WHERE h.weekStart = :weekStart AND (h.isPublic = true OR g.id = :currentMemberId OR g.team.id = :currentTeamId)")
    List<HighFive> findVisibleForWeek(
        @Param("weekStart") LocalDate weekStart,
        @Param("currentMemberId") UUID currentMemberId,
        @Param("currentTeamId") UUID currentTeamId
    );
}
