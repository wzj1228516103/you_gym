package com.yougym.api.analytics.dto;

import java.time.Instant;

public record AnalyticsUserQuery(Instant from, Instant to, String search, int page, int pageSize) {
    public int offset() { return (page - 1) * pageSize; }
}
