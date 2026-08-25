package com.yougym.api.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class RuntimeConfigurationValidator implements ApplicationRunner {
    private final RuntimeProperties runtime;
    private final AdminProperties admin;
    private final IntegrationProperties integrations;
    private final Environment environment;

    public RuntimeConfigurationValidator(RuntimeProperties runtime, AdminProperties admin,
                                         IntegrationProperties integrations, Environment environment) {
        this.runtime = runtime;
        this.admin = admin;
        this.integrations = integrations;
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!runtime.isProduction()) return;

        String datasourceUrl = environment.getProperty("spring.datasource.url", "");
        if (datasourceUrl.toLowerCase().startsWith("jdbc:h2:")) {
            throw new IllegalStateException("production requires a MySQL datasource; H2 is not allowed");
        }
        if (!"aliyun".equalsIgnoreCase(integrations.getMode())) {
            throw new IllegalStateException("production requires YOUGYM_INTEGRATION_MODE=aliyun");
        }
        if (admin.isTestAccessEnabled()) {
            throw new IllegalStateException("production must disable YOUGYM_ADMIN_TEST_ACCESS_ENABLED");
        }
        if (integrations.isTestEndpointsEnabled()) {
            throw new IllegalStateException("production must disable YOUGYM_INTEGRATION_TEST_ENDPOINTS_ENABLED");
        }
        if (admin.isRegistrationEnabled() && (admin.getRegistrationInviteCode() == null || admin.getRegistrationInviteCode().isBlank())) {
            throw new IllegalStateException("admin registration requires a non-empty invite code");
        }
    }
}
