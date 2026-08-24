package com.yougym.api.catalog.controller;

import com.yougym.api.audit.AuditLogService;
import com.yougym.api.config.AdminAccessService;
import com.yougym.api.config.AdminPermission;
import com.yougym.api.exercise.service.ExerciseCatalogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/v1/exercise-catalog")
public class ExerciseCatalogAdminController {
    private final AdminAccessService access;
    private final AuditLogService audit;
    private final ExerciseCatalogService service;

    public ExerciseCatalogAdminController(AdminAccessService access, AuditLogService audit, ExerciseCatalogService service) {
        this.access = access;
        this.audit = audit;
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) String search,
                                    @RequestParam(defaultValue = "100") int limit,
                                    HttpServletRequest request) {
        var principal = access.authorize(request, AdminPermission.CONTENT_READ);
        var items = service.find(search, null, Math.max(1, Math.min(limit, 2000)));
        audit.record(principal, "EXERCISE_CATALOG_VIEWED", "exercise_catalog", null, request,
                Map.of("count", items.size()));
        return Map.of("source", "exercise_catalog", "items", items, "total", service.count(search, null));
    }
}
