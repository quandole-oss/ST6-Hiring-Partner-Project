package com.st6.weeklycommit.model.dto;

import com.st6.weeklycommit.model.entity.ChessCategory;
import jakarta.validation.constraints.NotNull;

public record PatchItemCategoryRequest(@NotNull ChessCategory chessCategory) {}
