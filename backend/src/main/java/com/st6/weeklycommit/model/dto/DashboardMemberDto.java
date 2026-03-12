package com.st6.weeklycommit.model.dto;

import com.st6.weeklycommit.model.entity.CommitStatus;
import java.util.UUID;

public record DashboardMemberDto(UUID memberId, String memberName, CommitStatus commitStatus, int totalItems, int completedItems, int partialItems, double completionRate, double alignmentScore, int totalStoryPoints, int completedStoryPoints, int blockedItems, int atRiskItems, Integer moodScore, Integer previousMoodScore) {}
