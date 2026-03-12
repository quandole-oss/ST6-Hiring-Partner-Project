package com.st6.weeklycommit.repository;

import com.st6.weeklycommit.model.entity.TeamExportSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface TeamExportSettingsRepository extends JpaRepository<TeamExportSettings, UUID> {
    Optional<TeamExportSettings> findByTeamId(UUID teamId);
}
