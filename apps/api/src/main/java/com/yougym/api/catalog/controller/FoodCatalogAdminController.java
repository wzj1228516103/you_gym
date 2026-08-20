package com.yougym.api.catalog.controller;

import com.yougym.api.audit.AuditLogService;
import com.yougym.api.catalog.service.FoodCatalogService;
import com.yougym.api.config.AdminAccessService;
import com.yougym.api.config.AdminPermission;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/v1/food-catalog")
public class FoodCatalogAdminController {
    private final AdminAccessService access;
    private final AuditLogService audit;
    private final FoodCatalogService service;

    public FoodCatalogAdminController(AdminAccessService access, AuditLogService audit, FoodCatalogService service) {
        this.access = access;
        this.audit = audit;
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) String search,
                                    @RequestParam(required = false) String status,
                                    @RequestParam(defaultValue = "200") int limit,
                                    HttpServletRequest request) {
        var principal = access.authorize(request, AdminPermission.CATALOG_READ);
        var items = service.find(search, status, limit);
        audit.record(principal, "FOOD_CATALOG_VIEWED", "food_catalog", null, request, Map.of("count", items.size()));
        return Map.of("items", items);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@Valid @RequestBody FoodRequest body, HttpServletRequest request) {
        var principal = access.authorize(request, AdminPermission.CATALOG_MANAGE);
        var item = service.create(body.id(), body.name(), body.serving(), body.calories(), body.protein(), body.carbs(), body.fat(), body.source(), body.status());
        audit.record(principal, "FOOD_CREATED", "food_catalog", String.valueOf(item.get("id")), request, Map.of("name", item.get("name")));
        return item;
    }

    @PatchMapping("/{id}")
    public Map<String, Object> update(@PathVariable String id, @Valid @RequestBody FoodRequest body, HttpServletRequest request) {
        var principal = access.authorize(request, AdminPermission.CATALOG_MANAGE);
        var item = service.update(id, body.name(), body.serving(), body.calories(), body.protein(), body.carbs(), body.fat(), body.source());
        audit.record(principal, "FOOD_UPDATED", "food_catalog", id, request, Map.of());
        return item;
    }

    @PostMapping("/{id}/status")
    public Map<String, Object> status(@PathVariable String id, @RequestBody StatusRequest body, HttpServletRequest request) {
        var principal = access.authorize(request, AdminPermission.CATALOG_MANAGE);
        var item = service.changeStatus(id, body.status());
        audit.record(principal, "FOOD_STATUS_CHANGED", "food_catalog", id, request, Map.of("status", body.status()));
        return item;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable String id, HttpServletRequest request) {
        var principal = access.authorize(request, AdminPermission.CATALOG_MANAGE);
        service.delete(id);
        audit.record(principal, "FOOD_DELETED", "food_catalog", id, request, Map.of());
        return Map.of("deleted", true);
    }

    public record FoodRequest(
            @Size(max = 64) String id,
            @NotBlank @Size(max = 120) String name,
            @NotBlank @Size(max = 32) String serving,
            @NotNull @DecimalMin("0") BigDecimal calories,
            @NotNull @DecimalMin("0") BigDecimal protein,
            @NotNull @DecimalMin("0") BigDecimal carbs,
            @NotNull @DecimalMin("0") BigDecimal fat,
            @NotBlank @Size(max = 80) String source,
            String status) {}

    public record StatusRequest(@NotBlank String status) {}
}
