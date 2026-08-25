package com.yougym.api.analytics.controller;

import com.yougym.api.analytics.dto.AnalyticsUserQuery;
import com.yougym.api.analytics.service.AnalyticsUserService;
import com.yougym.api.analytics.vo.AnalyticsUserVO;
import com.yougym.api.audit.AuditLogService;
import com.yougym.api.config.AdminAccessService;
import com.yougym.api.config.AdminPermission;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/v1/analytics")
public class AnalyticsUserAdminController {
    private final AnalyticsUserService analyticsUserService;
    private final AdminAccessService accessService;
    private final AuditLogService auditLogService;

    public AnalyticsUserAdminController(AnalyticsUserService analyticsUserService,
                                        AdminAccessService accessService,
                                        AuditLogService auditLogService) {
        this.analyticsUserService = analyticsUserService;
        this.accessService = accessService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/users")
    public Map<String, Object> users(@RequestParam(required = false) Instant from,
                                     @RequestParam(required = false) Instant to,
                                     @RequestParam(required = false) String search,
                                     @RequestParam(defaultValue = "1") int page,
                                     @RequestParam(defaultValue = "50") int pageSize,
                                     @RequestParam(required = false) Integer limit,
                                     HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.ANALYTICS_READ);
        AnalyticsUserQuery query = query(from, to, search, page, pageSize, limit, 100);
        auditLogService.record(principal, "ANALYTICS_USERS_VIEWED", "analytics_user", null, request,
                search == null ? Map.of() : Map.of("search", search));
        List<AnalyticsUserVO> items = analyticsUserService.listUsers(query);
        return Map.of("from", query.from(), "to", query.to(), "items", items,
                "total", analyticsUserService.countUsers(query), "page", query.page(), "pageSize", query.pageSize());
    }

    @GetMapping(value = "/users.csv", produces = "text/csv")
    public ResponseEntity<byte[]> usersCsv(@RequestParam(required = false) Instant from,
                                           @RequestParam(required = false) Instant to,
                                           @RequestParam(required = false) String search,
                                           @RequestParam(defaultValue = "10000") int limit,
                                           HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.ANALYTICS_EXPORT);
        AnalyticsUserQuery query = query(from, to, search, 1, limit, null, 10000);
        var export = analyticsUserService.exportUsersCsv(query);
        auditLogService.record(principal, "ANALYTICS_USERS_EXPORTED", "analytics_user", null, request,
                Map.of("count", export.count()));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=analytics-users.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(export.content());
    }

    private static AnalyticsUserQuery query(Instant from, Instant to, String search, int page, int pageSize, Integer legacyLimit, int maxPageSize) {
        Instant resolvedTo = to == null ? Instant.now() : to;
        Instant resolvedFrom = from == null ? resolvedTo.minus(30, ChronoUnit.DAYS) : from;
        if (!resolvedFrom.isBefore(resolvedTo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "from must be before to");
        }
        int safePageSize = legacyLimit == null ? Math.max(1, Math.min(pageSize, maxPageSize)) : Math.max(1, Math.min(legacyLimit, maxPageSize));
        return new AnalyticsUserQuery(resolvedFrom, resolvedTo, search, Math.max(1, Math.min(page, 100000)), safePageSize);
    }
}
