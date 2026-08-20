package com.yougym.api.config;

import com.yougym.api.auth.AdminAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.EnumSet;
import java.util.Set;

@Service
public class AdminAccessService {
    private final AdminProperties properties;
    private final AdminAuthService authService;

    public AdminAccessService(AdminProperties properties, AdminAuthService authService) {
        this.properties = properties;
        this.authService = authService;
    }

    public AdminPrincipal authorize(HttpServletRequest request, AdminPermission permission) {
        AdminPrincipal principal = resolve(request);
        if (!permissions(principal.role()).contains(permission)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "admin permission denied");
        }
        return principal;
    }

    public AdminPrincipal authorize(String token, AdminPermission permission) {
        AdminPrincipal principal = resolve(token);
        if (!permissions(principal.role()).contains(permission)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "admin permission denied");
        }
        return principal;
    }

    public AdminPrincipal resolve(String token) {
        if (same(token, properties.getTestToken())) {
            return new AdminPrincipal("local-admin", properties.getTestRole());
        }
        if (same(token, properties.getEmployeeToken())) {
            return new AdminPrincipal("local-employee", AdminRole.EMPLOYEE);
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid admin token");
    }

    public AdminPrincipal resolve(HttpServletRequest request) {
        String authorization = request == null ? null : request.getHeader("Authorization");
        if (authorization != null) {
            if (!authorization.startsWith("Bearer ")) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid admin authorization header");
            }
            String token = authorization.substring(7).trim();
            if (token.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "missing admin bearer token");
            }
            return authService.resolveBearer(token);
        }
        return resolve(request == null ? null : request.getHeader("X-Admin-Test-Token"));
    }

    public Set<AdminPermission> permissions(AdminRole role) {
        if (role == AdminRole.SUPER_ADMIN) return EnumSet.allOf(AdminPermission.class);
        if (role == AdminRole.ADMIN) return EnumSet.of(AdminPermission.ANALYTICS_READ, AdminPermission.ANALYTICS_EXPORT,
                AdminPermission.CONTENT_READ, AdminPermission.CONTENT_MANAGE,
                AdminPermission.CATALOG_READ, AdminPermission.CATALOG_MANAGE);
        return EnumSet.of(AdminPermission.ANALYTICS_READ, AdminPermission.CONTENT_READ, AdminPermission.CATALOG_READ);
    }

    private static boolean same(String left, String right) {
        if (left == null || right == null || left.isBlank() || right.isBlank()) return false;
        return MessageDigest.isEqual(left.getBytes(StandardCharsets.UTF_8), right.getBytes(StandardCharsets.UTF_8));
    }

    public record AdminPrincipal(String subject, AdminRole role) {}
}
