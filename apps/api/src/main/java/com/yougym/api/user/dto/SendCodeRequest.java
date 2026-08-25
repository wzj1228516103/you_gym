package com.yougym.api.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SendCodeRequest(@NotBlank @Pattern(regexp = "^\\+?[0-9]{6,20}$") String phone,
                              @NotBlank String purpose) {}
