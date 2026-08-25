package com.yougym.api.anatomy;

import com.yougym.api.config.AdminAccessService;
import com.yougym.api.config.AdminPermission;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/v1/anatomy")
public class AnatomyAdminController {
    private final AdminAccessService accessService;
    private final AnatomyNodeRepository repository;

    public AnatomyAdminController(AdminAccessService accessService, AnatomyNodeRepository repository) {
        this.accessService = accessService;
        this.repository = repository;
    }

    @GetMapping("/nodes")
    public Map<String, Object> nodes(HttpServletRequest request) {
        accessService.authorize(request, AdminPermission.ANALYTICS_READ);
        return Map.of("version", 1, "items", repository.findAll());
    }
}
