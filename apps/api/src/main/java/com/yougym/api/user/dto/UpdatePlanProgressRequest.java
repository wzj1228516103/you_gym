package com.yougym.api.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdatePlanProgressRequest(
        @NotBlank @Pattern(regexp = "ACTIVE|PAUSED") String status
) {}
