package com.yougym.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "yougym.runtime")
public class RuntimeProperties {
    private String environment = "local";

    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }

    public boolean isProduction() {
        return "prod".equalsIgnoreCase(environment) || "production".equalsIgnoreCase(environment);
    }
}
