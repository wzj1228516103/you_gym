package com.yougym.api.analytics;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.Map;

public record AnalyticsEvent(
        @NotBlank String eventId,
        @NotBlank String eventName,
        Integer eventVersion,
        @NotNull Instant occurredAt,
        String sessionId,
        String analyticsUserId,
        String userId,
        String platform,
        String appVersion,
        String buildNumber,
        String locale,
        String timezone,
        String networkType,
        String screenId,
        Map<String, Object> properties
) {
    public int effectiveVersion() { return eventVersion == null ? 1 : eventVersion; }
    public String effectiveAnalyticsUserId() {
        return analyticsUserId == null || analyticsUserId.isBlank() ? userId : analyticsUserId;
    }
}
