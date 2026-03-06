package com.st6.weeklycommit.repository;

import com.st6.weeklycommit.model.entity.RallyCry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface RallyCryRepository extends JpaRepository<RallyCry, UUID> {}
