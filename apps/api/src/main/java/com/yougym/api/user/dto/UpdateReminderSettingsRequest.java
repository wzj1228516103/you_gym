package com.yougym.api.user.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateReminderSettingsRequest(
        @NotNull Boolean trainingEnabled,
        @NotNull Boolean nutritionEnabled,
        @NotNull Boolean restSoundEnabled
) {}
