package com.yougym.api.analytics.dto;

import java.time.Instant;

public record AnalyticsUserQuery(Instant from, Instant to, String search, int limit) {
}
