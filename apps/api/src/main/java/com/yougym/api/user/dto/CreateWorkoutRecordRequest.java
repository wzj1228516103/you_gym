package com.yougym.api.user.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.Map;

public record CreateWorkoutRecordRequest(@NotBlank String title, @Min(0) int durationSeconds,
                                         @Min(0) int totalSets, @Min(0) double totalVolume,
                                         @Min(0) int calories, Instant completedAt,
                                         Map<String, Object> metadata) {}
