package com.yougym.api.user.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.Map;

public record CreateNutritionRecordRequest(@NotBlank String mealName, @Min(0) double calories,
                                           @Min(0) double proteinG, @Min(0) double carbohydratesG,
                                           @Min(0) double fatG, @Min(0) int foodCount,
                                           Instant recordedAt, Map<String, Object> metadata) {}
