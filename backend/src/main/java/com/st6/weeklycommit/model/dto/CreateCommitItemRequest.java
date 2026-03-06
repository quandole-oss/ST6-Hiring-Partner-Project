package com.st6.weeklycommit.model.dto;

import com.st6.weeklycommit.model.entity.ChessCategory;
import com.st6.weeklycommit.validation.ValidFibonacci;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record CreateCommitItemRequest(UUID outcomeId, @NotBlank String title, String description, ChessCategory chessCategory, @ValidFibonacci Integer effortEstimate, @Min(1) @Max(5) Integer impactEstimate, int sortOrder) {}
