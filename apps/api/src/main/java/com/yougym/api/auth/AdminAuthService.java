package com.yougym.api.auth;

import com.yougym.api.config.AdminAccessService;
import com.yougym.api.config.AdminProperties;
import com.yougym.api.config.AdminRole;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.time.Duration;
import java.util.Base64;
import java.util.Locale;
import java.util.UUID;

@Service
public class AdminAuthService implements ApplicationRunner {
    private final AdminAccountRepository accountRepository;
    private final AdminSessionRepository sessionRepository;
    private final AdminProperties properties;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);
    private final SecureRandom secureRandom = new SecureRandom();

    public AdminAuthService(AdminAccountRepository accountRepository,
                            AdminSessionRepository sessionRepository,
                            AdminProperties properties) {
        this.accountRepository = accountRepository;
        this.sessionRepository = sessionRepository;
        this.properties = properties;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!properties.isBootstrapEnabled()) return;
        String username = normalizeUsername(properties.getBootstrapUsername());
        String password = properties.getBootstrapPassword();
        if (username.isBlank() || password == null || password.length() < 12) {
            throw new IllegalStateException("admin bootstrap requires a username and password of at least 12 characters");
        }
        if (accountRepository.findByUsername(username).isEmpty()) {
            accountRepository.insert(UUID.randomUUID().toString(), username,
                    properties.getBootstrapDisplayName(), passwordEncoder.encode(password),
                    AdminRole.SUPER_ADMIN, Instant.now());
        }
    }

    public LoginResult login(String username, String password) {
        AdminAccountRepository.AdminAccount account = accountRepository.findByUsername(normalizeUsername(username))
                .filter(candidate -> "ACTIVE".equals(candidate.status()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid admin credentials"));

        Instant now = Instant.now();
        if (account.lockedUntil() != null && account.lockedUntil().isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid admin credentials");
        }
        if (!passwordEncoder.matches(password, account.passwordHash())) {
            int attempts = account.failedLoginAttempts() + 1;
            Instant lockedUntil = attempts >= 5 ? now.plus(Duration.ofMinutes(15)) : null;
            accountRepository.recordFailedLogin(account.id(), attempts, lockedUntil, now);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid admin credentials");
        }

        accountRepository.resetFailedLogins(account.id(), now);
        Instant expiresAt = now.plus(Math.max(1, Math.min(properties.getSessionHours(), 24)), ChronoUnit.HOURS);
        String token = createToken();
        sessionRepository.insert(UUID.randomUUID().toString(), account.id(), tokenHash(token), now, expiresAt);
        return new LoginResult(token, expiresAt, account.username(), account.displayName(), account.role());
    }

    public AdminAccessService.AdminPrincipal resolveBearer(String token) {
        Instant now = Instant.now();
        AdminSessionRepository.SessionPrincipal session = sessionRepository.findActive(tokenHash(token), now)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid or expired admin session"));
        sessionRepository.touch(session.sessionId(), now);
        return new AdminAccessService.AdminPrincipal(session.username(), session.role());
    }

    public void logout(String token) {
        sessionRepository.revoke(tokenHash(token), Instant.now());
    }

    public String sessionId(String token) {
        return sessionRepository.findActive(tokenHash(token), Instant.now())
                .map(AdminSessionRepository.SessionPrincipal::sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid or expired admin session"));
    }

    private String createToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return "yg_admin_" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String tokenHash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException("SHA-256 is unavailable", impossible);
        }
    }

    private static String normalizeUsername(String username) {
        return username == null ? "" : username.trim().toLowerCase(Locale.ROOT);
    }

    public record LoginResult(String token, Instant expiresAt, String username,
                              String displayName, AdminRole role) {}
}
