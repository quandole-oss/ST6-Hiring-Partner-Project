package com.st6.weeklycommit.model.dto;

import java.util.UUID;

public record LoginResponse(String token, UUID memberId, String name, String role) {}
