package com.yougym.api.auth;

import com.yougym.api.audit.AuditLogService;
import com.yougym.api.config.AdminAccessService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/v1/auth")
public class AdminAuthController {
    private final AdminAuthService authService;
    private final AdminAccountService accountService;
    private final AuditLogService auditLogService;

    public AdminAuthController(AdminAuthService authService, AdminAccountService accountService,
                               AuditLogService auditLogService) {
        this.authService = authService;
        this.accountService = accountService;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> register(@Valid @RequestBody RegisterRequest request,
                                        HttpServletRequest servletRequest) {
        var account = accountService.registerEmployee(request.username(), request.displayName(),
                request.password(), request.inviteCode());
        var principal = new AdminAccessService.AdminPrincipal(account.username(), account.role());
        auditLogService.record(principal, "ADMIN_ACCOUNT_REGISTERED", "admin_account", account.id(),
                servletRequest, Map.of("role", account.role().name()));
        return Map.of("username", account.username(), "displayName", account.displayName(),
                "role", account.role().name(), "status", account.status());
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        AdminAuthService.LoginResult result = authService.login(request.username(), request.password());
        var principal = new AdminAccessService.AdminPrincipal(result.username(), result.role());
        auditLogService.record(principal, "ADMIN_LOGIN_SUCCEEDED", "admin_session", null,
                servletRequest, Map.of());
        return Map.of(
                "token", result.token(),
                "tokenType", "Bearer",
                "expiresAt", result.expiresAt(),
                "username", result.username(),
                "displayName", result.displayName(),
                "role", result.role().name()
        );
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@RequestHeader(value = "Authorization", required = false) String authorization,
                       HttpServletRequest request) {
        String token = bearerToken(authorization);
        AdminAccessService.AdminPrincipal principal = authService.resolveBearer(token);
        authService.logout(token);
        auditLogService.record(principal, "ADMIN_LOGOUT", "admin_session", principal.subject(), request, Map.of());
    }

    private static String bearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "missing admin bearer token");
        }
        String token = authorization.substring(7).trim();
        if (token.isEmpty()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "missing admin bearer token");
        return token;
    }

    public record LoginRequest(@NotBlank @Size(max = 80) String username,
                               @NotBlank @Size(max = 200) String password) {}

    public record RegisterRequest(
            @NotBlank @jakarta.validation.constraints.Pattern(regexp = "^[A-Za-z0-9._-]{3,80}$") String username,
            @NotBlank @Size(max = 120) String displayName,
            @NotBlank @Size(min = 12, max = 200) String password,
            @NotBlank @Size(max = 200) String inviteCode) {}
}
