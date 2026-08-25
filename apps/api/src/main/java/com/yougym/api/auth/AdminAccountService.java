package com.yougym.api.auth;

import com.yougym.api.config.AdminRole;
import com.yougym.api.config.AdminProperties;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.UUID;

@Service
public class AdminAccountService {
    private final AdminAccountRepository repository;
    private final AdminProperties properties;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

    public AdminAccountService(AdminAccountRepository repository, AdminProperties properties) {
        this.repository = repository;
        this.properties = properties;
    }

    public AdminAccountRepository.AdminAccountView registerEmployee(String username, String displayName,
                                                                     String password, String inviteCode) {
        String expected = properties.getRegistrationInviteCode();
        if (!properties.isRegistrationEnabled() || expected == null || expected.isBlank()
                || !MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                (inviteCode == null ? "" : inviteCode).getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "admin registration is unavailable or invite code is invalid");
        }
        return create(username, displayName, password, AdminRole.EMPLOYEE);
    }

    public AdminAccountRepository.AdminAccountView create(String username, String displayName,
                                                          String password, AdminRole role) {
        String normalized = normalize(username);
        if (repository.existsByUsername(normalized)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "admin username already exists");
        }
        Instant now = Instant.now();
        repository.insert(UUID.randomUUID().toString(), normalized, displayName.trim(),
                passwordEncoder.encode(password), role, now);
        return repository.findAllViews().stream()
                .filter(account -> account.username().equals(normalized))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("created admin account could not be loaded"));
    }

    public void update(String username, AdminRole role, String status) {
        String normalized = normalize(username);
        if (repository.findByUsername(normalized).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "admin account not found");
        }
        if (!"ACTIVE".equals(status) && !"LOCKED".equals(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid admin account status");
        }
        repository.updateRoleAndStatus(normalized, role, status, Instant.now());
    }

    public static String normalize(String username) {
        return username == null ? "" : username.trim().toLowerCase(java.util.Locale.ROOT);
    }
}
