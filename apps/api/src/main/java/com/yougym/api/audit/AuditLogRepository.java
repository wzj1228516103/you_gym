package com.yougym.api.audit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yougym.api.config.AdminRole;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Repository
public class AuditLogRepository {
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public AuditLogRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public void insert(String id, Instant occurredAt, String actorSubject, AdminRole actorRole,
                       String action, String resourceType, String resourceId, String ipAddress,
                       Map<String, Object> metadata) {
        jdbcTemplate.update("""
                INSERT INTO admin_audit_log (
                    id, occurred_at, actor_subject, actor_role, action,
                    resource_type, resource_id, ip_address, metadata_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, Timestamp.from(occurredAt), actorSubject, actorRole.name(), action,
                resourceType, resourceId, ipAddress, metadataJson(metadata));
    }

    public List<AuditLogRow> find(Instant from, Instant to, int limit) {
        return jdbcTemplate.query("""
                SELECT id, occurred_at, actor_subject, actor_role, action,
                       resource_type, resource_id, ip_address, metadata_json
                FROM admin_audit_log
                WHERE occurred_at >= ? AND occurred_at < ?
                ORDER BY occurred_at DESC
                LIMIT ?
                """, (rs, rowNum) -> new AuditLogRow(
                rs.getString("id"), rs.getTimestamp("occurred_at").toInstant(),
                rs.getString("actor_subject"), rs.getString("actor_role"),
                rs.getString("action"), rs.getString("resource_type"),
                rs.getString("resource_id"), rs.getString("ip_address"),
                rs.getString("metadata_json")), Timestamp.from(from), Timestamp.from(to), limit);
    }

    private String metadataJson(Map<String, Object> metadata) {
        try {
            return objectMapper.writeValueAsString(metadata == null ? Map.of() : metadata);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("invalid audit metadata", exception);
        }
    }

    public record AuditLogRow(String id, Instant occurredAt, String actorSubject, String actorRole,
                              String action, String resourceType, String resourceId,
                              String ipAddress, String metadataJson) {}
}
