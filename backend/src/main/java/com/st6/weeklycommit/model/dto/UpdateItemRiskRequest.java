package com.st6.weeklycommit.model.dto;

import com.st6.weeklycommit.model.entity.RiskFlag;

public record UpdateItemRiskRequest(RiskFlag riskFlag, String riskNote) {}
