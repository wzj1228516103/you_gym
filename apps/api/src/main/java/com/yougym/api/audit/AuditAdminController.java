package com.yougym.api.audit;

import com.yougym.api.config.AdminAccessService;
import com.yougym.api.config.AdminPermission;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/v1/audit")
public class AuditAdminController {
    private final AdminAccessService accessService;
    private final AuditLogRepository repository;

    public AuditAdminController(AdminAccessService accessService, AuditLogRepository repository) {
        this.accessService = accessService;
        this.repository = repository;
    }

    @GetMapping("/logs")
    public Map<String, Object> logs(@RequestParam(required = false) Instant from,
                                    @RequestParam(required = false) Instant to,
                                    @RequestParam(defaultValue = "100") int limit,
                                    HttpServletRequest request) {
        accessService.authorize(request, AdminPermission.AUDIT_READ);
        Instant resolvedTo = to == null ? Instant.now() : to;
        Instant resolvedFrom = from == null ? resolvedTo.minus(30, ChronoUnit.DAYS) : from;
        if (!resolvedFrom.isBefore(resolvedTo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "from must be before to");
        }
        int safeLimit = Math.max(1, Math.min(limit, 1000));
        return Map.of("from", resolvedFrom, "to", resolvedTo,
                "items", repository.find(resolvedFrom, resolvedTo, safeLimit));
    }
}
