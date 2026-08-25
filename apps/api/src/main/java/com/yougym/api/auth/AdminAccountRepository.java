package com.yougym.api.auth;

import com.yougym.api.config.AdminRole;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.List;

@Repository
public class AdminAccountRepository {
    private final JdbcTemplate jdbcTemplate;

    public AdminAccountRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<AdminAccount> findByUsername(String username) {
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject("""
                    SELECT id, username, display_name, password_hash, role, status
                           , failed_login_attempts, locked_until
                    FROM admin_account WHERE username = ?
                    """, (rs, rowNum) -> new AdminAccount(
                    rs.getString("id"), rs.getString("username"), rs.getString("display_name"),
                    rs.getString("password_hash"), AdminRole.valueOf(rs.getString("role")),
                    rs.getString("status"), rs.getInt("failed_login_attempts"),
                    rs.getTimestamp("locked_until") == null ? null : rs.getTimestamp("locked_until").toInstant()), username));
        } catch (EmptyResultDataAccessException missing) {
            return Optional.empty();
        }
    }

    public List<AdminAccountView> findAllViews() {
        return jdbcTemplate.query("""
                SELECT id, username, display_name, role, status, created_at, updated_at, last_login_at
                FROM admin_account ORDER BY created_at ASC
                """, (rs, rowNum) -> new AdminAccountView(
                rs.getString("id"), rs.getString("username"), rs.getString("display_name"),
                AdminRole.valueOf(rs.getString("role")), rs.getString("status"),
                rs.getTimestamp("created_at").toInstant(), rs.getTimestamp("updated_at").toInstant(),
                rs.getTimestamp("last_login_at") == null ? null : rs.getTimestamp("last_login_at").toInstant()));
    }

    public boolean existsByUsername(String username) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM admin_account WHERE username = ?", Integer.class, username);
        return count != null && count > 0;
    }

    public void updateRoleAndStatus(String username, AdminRole role, String status, Instant now) {
        jdbcTemplate.update("UPDATE admin_account SET role = ?, status = ?, updated_at = ? WHERE username = ?",
                role.name(), status, Timestamp.from(now), username);
    }

    public void insert(String id, String username, String displayName, String passwordHash,
                       AdminRole role, Instant now) {
        jdbcTemplate.update("""
                INSERT INTO admin_account (
                    id, username, display_name, password_hash, role, status,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
                """, id, username, displayName, passwordHash, role.name(),
                Timestamp.from(now), Timestamp.from(now));
    }

    public void updateLastLogin(String id, Instant now) {
        jdbcTemplate.update("UPDATE admin_account SET last_login_at = ?, updated_at = ? WHERE id = ?",
                Timestamp.from(now), Timestamp.from(now), id);
    }

    public void recordFailedLogin(String id, int attempts, Instant lockedUntil, Instant now) {
        jdbcTemplate.update("UPDATE admin_account SET failed_login_attempts = ?, locked_until = ?, updated_at = ? WHERE id = ?",
                attempts, lockedUntil == null ? null : Timestamp.from(lockedUntil), Timestamp.from(now), id);
    }

    public void resetFailedLogins(String id, Instant now) {
        jdbcTemplate.update("UPDATE admin_account SET failed_login_attempts = 0, locked_until = NULL, last_login_at = ?, updated_at = ? WHERE id = ?",
                Timestamp.from(now), Timestamp.from(now), id);
    }

    public record AdminAccount(String id, String username, String displayName,
                               String passwordHash, AdminRole role, String status,
                               int failedLoginAttempts, Instant lockedUntil) {}

    public record AdminAccountView(String id, String username, String displayName, AdminRole role,
                                   String status, Instant createdAt, Instant updatedAt, Instant lastLoginAt) {}
}
