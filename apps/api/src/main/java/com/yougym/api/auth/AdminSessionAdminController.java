package com.yougym.api.auth;

import com.yougym.api.audit.AuditLogService;
import com.yougym.api.config.AdminAccessService;
import com.yougym.api.config.AdminPermission;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/v1/sessions")
public class AdminSessionAdminController {
    private final AdminAccessService accessService;
    private final AdminAuthService authService;
    private final AdminSessionRepository repository;
    private final AuditLogService auditLogService;

    public AdminSessionAdminController(AdminAccessService accessService, AdminAuthService authService,
                                       AdminSessionRepository repository, AuditLogService auditLogService) {
        this.accessService = accessService;
        this.authService = authService;
        this.repository = repository;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam(defaultValue = "100") int limit, HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.ADMIN_ACCOUNT_MANAGE);
        int safeLimit = Math.max(1, Math.min(limit, 500));
        return Map.of("items", repository.findAllViews(Instant.now(), safeLimit));
    }

    @PostMapping("/{sessionId}/revoke")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revoke(@PathVariable String sessionId, HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.ADMIN_ACCOUNT_MANAGE);
        if (!repository.revokeById(sessionId, Instant.now())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "active admin session not found");
        }
        auditLogService.record(principal, "ADMIN_SESSION_REVOKED", "admin_session", sessionId, request, Map.of());
    }

    @PostMapping("/revoke-all")
    public Map<String, Object> revokeAll(HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.ADMIN_ACCOUNT_MANAGE);
        String currentSessionId = currentSessionId(request);
        int revoked = repository.revokeAllExcept(currentSessionId, Instant.now());
        auditLogService.record(principal, "ADMIN_SESSIONS_REVOKED_ALL", "admin_session", null, request,
                Map.of("revokedCount", revoked));
        return Map.of("revokedCount", revoked);
    }

    private String currentSessionId(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return "__test-token-session__";
        }
        return authService.sessionId(authorization.substring(7).trim());
    }
}
