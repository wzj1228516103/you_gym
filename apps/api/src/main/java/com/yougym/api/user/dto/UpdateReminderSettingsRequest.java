package com.yougym.api.user.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateReminderSettingsRequest(
        @NotNull Boolean trainingEnabled,
        @NotNull Boolean nutritionEnabled,
        @NotNull Boolean restSoundEnabled,
        @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "训练提醒时间格式应为 HH:mm") String trainingTime,
        @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "饮食提醒时间格式应为 HH:mm") String nutritionTime,
        @Size(max = 64, message = "时区长度不能超过 64") String timezone,
        @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "免打扰开始时间格式应为 HH:mm") String quietHoursStart,
        @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "免打扰结束时间格式应为 HH:mm") String quietHoursEnd
) {}
