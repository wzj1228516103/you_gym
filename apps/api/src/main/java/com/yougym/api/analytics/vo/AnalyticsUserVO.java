package com.yougym.api.analytics.vo;

import java.time.Instant;

public record AnalyticsUserVO(
        String analyticsUserId,
        long eventCount,
        Instant firstSeen,
        Instant lastSeen,
        String platform
) {
    public String userType() {
        return analyticsUserId != null && analyticsUserId.startsWith("anonymous_") ? "GUEST" : "IDENTIFIED";
    }
}
