package com.yougym.api.catalog.controller;

import com.yougym.api.audit.AuditLogService;
import com.yougym.api.config.AdminAccessService;
import com.yougym.api.config.AdminPermission;
import com.yougym.api.exercise.service.ExerciseCatalogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import java.util.List;

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

    @PatchMapping("/{id}")
    public Map<String, Object> update(@PathVariable String id, @Valid @RequestBody ExerciseRequest body, HttpServletRequest request) {
        var principal = access.authorize(request, AdminPermission.CATALOG_MANAGE);
        var item = service.update(id, body.nameZh(), body.nameEn(), body.targetMuscles(), body.equipment(), body.location(),
                body.difficultyLevel(), body.recommendedReps(), body.recommendedSets(), body.restSecondsMin(), body.restSecondsMax(), body.sourceNote());
        audit.record(principal, "EXERCISE_CATALOG_UPDATED", "exercise_catalog", id, request, Map.of());
        return item;
    }

    public record ExerciseRequest(
            @NotBlank @Size(max = 120) String nameZh,
            @Size(max = 160) String nameEn,
            @NotEmpty @Size(max = 12) List<@NotBlank @Size(max = 80) String> targetMuscles,
            @Size(max = 80) String equipment,
            @NotBlank @Size(max = 40) String location,
            @NotBlank @Size(max = 24) String difficultyLevel,
            @Size(max = 40) String recommendedReps,
            @Size(max = 40) String recommendedSets,
            @Min(0) Integer restSecondsMin,
            @Min(0) Integer restSecondsMax,
            @Size(max = 500) String sourceNote) {}
}
