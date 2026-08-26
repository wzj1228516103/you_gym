package com.yougym.api.user.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record CreateBodyMeasurementRequest(
        @DecimalMin("50") @DecimalMax("260") Double heightCm,
        @DecimalMin("20") @DecimalMax("400") Double weightKg,
        @DecimalMin("1") @DecimalMax("70") Double bodyFatPct,
        @DecimalMin("20") @DecimalMax("300") Double waistCm,
        @DecimalMin("20") @DecimalMax("300") Double chestCm,
        @DecimalMin("20") @DecimalMax("300") Double hipCm,
        @DecimalMin("10") @DecimalMax("150") Double armCm,
        @Size(max = 240) String note,
        Instant measuredAt
) {}
