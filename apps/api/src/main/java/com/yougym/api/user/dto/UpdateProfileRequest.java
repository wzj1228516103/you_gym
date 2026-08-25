package com.yougym.api.user.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateProfileRequest(@Size(max = 80) String nickname, String gender, Integer birthYear,
                                   @DecimalMin("50") @DecimalMax("260") Double heightCm,
                                   @DecimalMin("20") @DecimalMax("400") Double weightKg,
                                   @DecimalMin("1") @DecimalMax("70") Double bodyFatPct,
                                   @Size(max = 32) String goal, @Size(max = 32) String experienceLevel,
                                   @Size(max = 16) String weeklyFrequency, @Size(max = 32) String venue,
                                   List<@Size(max = 32) String> equipment) {}
