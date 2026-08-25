package com.yougym.api.config;

import com.yougym.api.audit.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/v1/session")
public class AdminSessionController {
    private final AdminAccessService accessService;
    private final AuditLogService auditLogService;

    public AdminSessionController(AdminAccessService accessService, AuditLogService auditLogService) {
        this.accessService = accessService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public Map<String, Object> session(HttpServletRequest request) {
        AdminAccessService.AdminPrincipal principal = accessService.resolve(request);
        auditLogService.record(principal, "ADMIN_SESSION_VIEWED", "admin_session", principal.subject(), request, Map.of());
        return Map.of(
                "subject", principal.subject(),
                "role", principal.role().name(),
                "permissions", accessService.permissions(principal.role()).stream().map(Enum::name).sorted().toList()
        );
    }
}
