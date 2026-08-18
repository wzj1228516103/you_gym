package com.yougym.api.content;

import com.yougym.api.audit.AuditLogService;
import com.yougym.api.config.AdminAccessService;
import com.yougym.api.config.AdminPermission;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/v1/content")
public class ContentAdminController {
    private final AdminAccessService accessService;
    private final AuditLogService auditLogService;
    private final ContentRepository repository;
    private final ContentService service;

    public ContentAdminController(AdminAccessService accessService, AuditLogService auditLogService,
                                  ContentRepository repository, ContentService service) {
        this.accessService = accessService;
        this.auditLogService = auditLogService;
        this.repository = repository;
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) String status,
                                    @RequestParam(required = false) String contentType,
                                    @RequestParam(required = false) String search,
                                    @RequestParam(defaultValue = "100") int limit,
                                    HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.CONTENT_READ);
        auditLogService.record(principal, "CONTENT_LIST_VIEWED", "content", null, request, Map.of());
        int safeLimit = Math.max(1, Math.min(limit, 500));
        return Map.of("items", repository.find(status, contentType, search, safeLimit));
    }

    @GetMapping("/{id}")
    public ContentRepository.ContentItem get(@PathVariable String id, HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.CONTENT_READ);
        auditLogService.record(principal, "CONTENT_VIEWED", "content", id, request, Map.of());
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContentRepository.ContentItem create(@Valid @RequestBody ContentRequest body, HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.CONTENT_MANAGE);
        var item = service.create(body, principal.subject());
        auditLogService.record(principal, "CONTENT_CREATED", "content", item.id(), request, Map.of("contentType", item.contentType()));
        return item;
    }

    @PatchMapping("/{id}")
    public ContentRepository.ContentItem update(@PathVariable String id, @Valid @RequestBody ContentRequest body, HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.CONTENT_MANAGE);
        var item = service.update(id, body, principal.subject());
        auditLogService.record(principal, "CONTENT_UPDATED", "content", id, request, Map.of());
        return item;
    }

    @PostMapping("/{id}/status")
    public ContentRepository.ContentItem status(@PathVariable String id, @Valid @RequestBody StatusRequest body, HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.CONTENT_MANAGE);
        var item = service.changeStatus(id, body.status(), principal.subject());
        auditLogService.record(principal, "CONTENT_STATUS_CHANGED", "content", id, request, Map.of("status", body.status()));
        return item;
    }

    public record ContentRequest(@NotBlank String title, @NotBlank String contentType, String summary,
                                 String body, String mediaUrl, String anatomyNodeId) {}
    public record StatusRequest(@NotBlank String status) {}
}
