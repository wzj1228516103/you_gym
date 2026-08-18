package com.yougym.api.audit;

import com.yougym.api.config.AdminAccessService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class AuditLogService {
    private final AuditLogRepository repository;

    public AuditLogService(AuditLogRepository repository) {
        this.repository = repository;
    }

    public void record(AdminAccessService.AdminPrincipal principal, String action,
                       String resourceType, String resourceId, HttpServletRequest request,
                       Map<String, Object> metadata) {
        repository.insert(UUID.randomUUID().toString(), Instant.now(), principal.subject(), principal.role(),
                action, resourceType, resourceId, request == null ? null : request.getRemoteAddr(), metadata);
    }
}
