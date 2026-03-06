package com.st6.weeklycommit.model.dto;

import java.util.UUID;

public record TeamMemberDto(UUID id, UUID teamId, String name, String email, String role) {}
