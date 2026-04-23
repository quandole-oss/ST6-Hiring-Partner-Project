package com.st6.weeklycommit.repository;

import com.st6.weeklycommit.model.entity.TeamMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID> {
    List<TeamMember> findByTeamId(UUID teamId);
    Page<TeamMember> findByTeamId(UUID teamId, Pageable pageable);
    Optional<TeamMember> findByEmail(String email);
    Optional<TeamMember> findByGoogleId(String googleId);
}
