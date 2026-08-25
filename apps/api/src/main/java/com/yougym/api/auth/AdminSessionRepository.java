package com.yougym.api.auth;

import com.yougym.api.config.AdminRole;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public class AdminSessionRepository {
    private final JdbcTemplate jdbcTemplate;

    public AdminSessionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void insert(String id, String accountId, String tokenHash, Instant createdAt, Instant expiresAt) {
        jdbcTemplate.update("""
                INSERT INTO admin_session (
                    id, account_id, token_hash, created_at, expires_at, last_used_at
                ) VALUES (?, ?, ?, ?, ?, ?)
                """, id, accountId, tokenHash, Timestamp.from(createdAt),
                Timestamp.from(expiresAt), Timestamp.from(createdAt));
    }

    public Optional<SessionPrincipal> findActive(String tokenHash, Instant now) {
        try {
            SessionPrincipal principal = jdbcTemplate.queryForObject("""
                    SELECT s.id AS session_id, a.id AS account_id, a.username, a.display_name, a.role
                    FROM admin_session s
                    JOIN admin_account a ON a.id = s.account_id
                    WHERE s.token_hash = ? AND s.revoked_at IS NULL
                      AND s.expires_at > ? AND a.status = 'ACTIVE'
                    """, (rs, rowNum) -> new SessionPrincipal(
                    rs.getString("session_id"), rs.getString("account_id"),
                    rs.getString("username"), rs.getString("display_name"),
                    AdminRole.valueOf(rs.getString("role"))), tokenHash, Timestamp.from(now));
            return Optional.ofNullable(principal);
        } catch (EmptyResultDataAccessException missing) {
            return Optional.empty();
        }
    }

    public void touch(String sessionId, Instant now) {
        jdbcTemplate.update("UPDATE admin_session SET last_used_at = ? WHERE id = ?",
                Timestamp.from(now), sessionId);
    }

    public void revoke(String tokenHash, Instant now) {
        jdbcTemplate.update("""
                UPDATE admin_session SET revoked_at = ?
                WHERE token_hash = ? AND revoked_at IS NULL
                """, Timestamp.from(now), tokenHash);
    }

    public List<SessionView> findAllViews(Instant now, int limit) {
        return jdbcTemplate.query("""
                SELECT s.id, a.username, a.display_name, a.role,
                       s.created_at, s.expires_at, s.last_used_at, s.revoked_at
                FROM admin_session s
                JOIN admin_account a ON a.id = s.account_id
                ORDER BY s.created_at DESC
                LIMIT ?
                """, (rs, rowNum) -> new SessionView(
                rs.getString("id"), rs.getString("username"), rs.getString("display_name"),
                AdminRole.valueOf(rs.getString("role")),
                rs.getTimestamp("created_at").toInstant(), rs.getTimestamp("expires_at").toInstant(),
                rs.getTimestamp("last_used_at").toInstant(),
                rs.getTimestamp("revoked_at") == null ? null : rs.getTimestamp("revoked_at").toInstant(),
                rs.getTimestamp("revoked_at") == null && rs.getTimestamp("expires_at").toInstant().isAfter(now)), limit);
    }

    public boolean revokeById(String sessionId, Instant now) {
        return jdbcTemplate.update("""
                UPDATE admin_session SET revoked_at = ?
                WHERE id = ? AND revoked_at IS NULL
                """, Timestamp.from(now), sessionId) > 0;
    }

    public int revokeAllExcept(String sessionId, Instant now) {
        return jdbcTemplate.update("""
                UPDATE admin_session SET revoked_at = ?
                WHERE revoked_at IS NULL AND id <> ?
                """, Timestamp.from(now), sessionId);
    }

    public record SessionPrincipal(String sessionId, String accountId, String username,
                                   String displayName, AdminRole role) {}

    public record SessionView(String id, String username, String displayName, AdminRole role,
                              Instant createdAt, Instant expiresAt, Instant lastUsedAt,
                              Instant revokedAt, boolean active) {}
}
