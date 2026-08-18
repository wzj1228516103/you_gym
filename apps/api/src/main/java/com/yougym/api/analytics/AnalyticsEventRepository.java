package com.yougym.api.analytics;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Repository
public class AnalyticsEventRepository {
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public AnalyticsEventRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public boolean insert(AnalyticsEvent event) {
        String sql = """
                INSERT INTO analytics_event (
                    event_id, event_name, event_version, occurred_at, session_id,
                    analytics_user_id, platform, app_version, build_number, locale,
                    timezone, network_type, screen_id, properties_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        try {
            jdbcTemplate.update(sql,
                    event.eventId(), event.eventName(), event.effectiveVersion(), Timestamp.from(event.occurredAt()),
                    event.sessionId(), event.effectiveAnalyticsUserId(), event.platform(), event.appVersion(),
                    event.buildNumber(), event.locale(), event.timezone(), event.networkType(), event.screenId(),
                    propertiesJson(event.properties()));
            return true;
        } catch (DuplicateKeyException duplicate) {
            return false;
        }
    }

    public List<AnalyticsEventRow> find(Instant from, Instant to, String eventName, int limit) {
        StringBuilder sql = new StringBuilder("SELECT event_id,event_name,event_version,occurred_at,received_at,session_id,analytics_user_id,platform,app_version,build_number,locale,timezone,network_type,screen_id,properties_json FROM analytics_event WHERE occurred_at >= ? AND occurred_at < ?");
        if (eventName != null && !eventName.isBlank()) sql.append(" AND event_name = ?");
        sql.append(" ORDER BY occurred_at DESC LIMIT ?");
        if (eventName == null || eventName.isBlank()) {
            return jdbcTemplate.query(sql.toString(), this::mapRow, Timestamp.from(from), Timestamp.from(to), limit);
        }
        return jdbcTemplate.query(sql.toString(), this::mapRow, Timestamp.from(from), Timestamp.from(to), eventName, limit);
    }

    public List<AnalyticsSummaryRow> summarize(Instant from, Instant to) {
        return jdbcTemplate.query("SELECT event_name, COUNT(*) AS event_count, COUNT(DISTINCT analytics_user_id) AS unique_users FROM analytics_event WHERE occurred_at >= ? AND occurred_at < ? GROUP BY event_name ORDER BY event_count DESC", (rs, rowNum) -> new AnalyticsSummaryRow(rs.getString("event_name"), rs.getLong("event_count"), rs.getLong("unique_users")), Timestamp.from(from), Timestamp.from(to));
    }

    public List<DashboardEventRow> findForDashboard(Instant from, Instant to) {
        return jdbcTemplate.query("""
                SELECT event_name, occurred_at, session_id, analytics_user_id, platform, properties_json
                FROM analytics_event
                WHERE occurred_at >= ? AND occurred_at < ?
                ORDER BY occurred_at ASC
                """, (rs, rowNum) -> new DashboardEventRow(
                rs.getString("event_name"), rs.getTimestamp("occurred_at").toInstant(),
                rs.getString("session_id"), rs.getString("analytics_user_id"),
                rs.getString("platform"), rs.getString("properties_json")),
                Timestamp.from(from), Timestamp.from(to));
    }

    private AnalyticsEventRow mapRow(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new AnalyticsEventRow(rs.getString("event_id"), rs.getString("event_name"), rs.getInt("event_version"),
                rs.getTimestamp("occurred_at").toInstant(), rs.getTimestamp("received_at").toInstant(),
                rs.getString("session_id"), rs.getString("analytics_user_id"), rs.getString("platform"),
                rs.getString("app_version"), rs.getString("build_number"), rs.getString("locale"),
                rs.getString("timezone"), rs.getString("network_type"), rs.getString("screen_id"),
                rs.getString("properties_json"));
    }

    private String propertiesJson(Map<String, Object> properties) {
        try { return objectMapper.writeValueAsString(properties == null ? Map.of() : properties); }
        catch (JsonProcessingException e) { throw new IllegalArgumentException("invalid analytics properties", e); }
    }

    public record AnalyticsEventRow(String eventId, String eventName, int eventVersion, Instant occurredAt,
                                    Instant receivedAt, String sessionId, String analyticsUserId, String platform,
                                    String appVersion, String buildNumber, String locale, String timezone,
                                    String networkType, String screenId, String propertiesJson) {}
    public record AnalyticsSummaryRow(String eventName, long eventCount, long uniqueUsers) {}
    public record DashboardEventRow(String eventName, Instant occurredAt, String sessionId,
                                    String analyticsUserId, String platform, String propertiesJson) {}
}
