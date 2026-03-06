package com.st6.weeklycommit.repository;

import com.st6.weeklycommit.model.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team, UUID> {}
