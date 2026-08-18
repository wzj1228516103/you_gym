package com.yougym.api.auth;

import com.yougym.api.audit.AuditLogService;
import com.yougym.api.config.AdminAccessService;
import com.yougym.api.config.AdminPermission;
import com.yougym.api.config.AdminRole;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/v1/accounts")
public class AdminAccountController {
    private final AdminAccessService accessService;
    private final AdminAccountService accountService;
    private final AdminAccountRepository repository;
    private final AuditLogService auditLogService;

    public AdminAccountController(AdminAccessService accessService, AdminAccountService accountService,
                                  AdminAccountRepository repository, AuditLogService auditLogService) {
        this.accessService = accessService;
        this.accountService = accountService;
        this.repository = repository;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public Map<String, Object> list(HttpServletRequest request) {
        accessService.authorize(request, AdminPermission.ADMIN_ACCOUNT_MANAGE);
        return Map.of("items", repository.findAllViews());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminAccountRepository.AdminAccountView create(@Valid @RequestBody CreateRequest body,
                                                          HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.ADMIN_ACCOUNT_MANAGE);
        var account = accountService.create(body.username(), body.displayName(), body.password(), body.role());
        auditLogService.record(principal, "ADMIN_ACCOUNT_CREATED", "admin_account", account.id(), request,
                Map.of("username", account.username(), "role", account.role().name()));
        return account;
    }

    @PatchMapping("/{username}")
    public Map<String, Object> update(@PathVariable String username, @Valid @RequestBody UpdateRequest body,
                                      HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.ADMIN_ACCOUNT_MANAGE);
        accountService.update(username, body.role(), body.status());
        auditLogService.record(principal, "ADMIN_ACCOUNT_UPDATED", "admin_account", username, request,
                Map.of("role", body.role().name(), "status", body.status()));
        return Map.of("updated", true);
    }

    public record CreateRequest(
            @NotBlank @Pattern(regexp = "^[A-Za-z0-9._-]{3,80}$") String username,
            @NotBlank @Size(max = 120) String displayName,
            @NotBlank @Size(min = 12, max = 200) String password,
            @NotNull AdminRole role) {}

    public record UpdateRequest(@NotNull AdminRole role, @NotBlank String status) {}
}
