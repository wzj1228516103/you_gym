package com.yougym.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "yougym.admin")
public class AdminProperties {
    private String testToken = "local-admin";
    private AdminRole testRole = AdminRole.SUPER_ADMIN;
    private String employeeToken = "local-employee";
    private boolean testAccessEnabled = true;
    private boolean bootstrapEnabled;
    private String bootstrapUsername = "";
    private String bootstrapPassword = "";
    private String bootstrapDisplayName = "Local Super Admin";
    private int sessionHours = 8;
    private boolean registrationEnabled;
    private String registrationInviteCode = "";

    public String getTestToken() { return testToken; }
    public void setTestToken(String testToken) { this.testToken = testToken; }
    public AdminRole getTestRole() { return testRole; }
    public void setTestRole(AdminRole testRole) { this.testRole = testRole; }
    public String getEmployeeToken() { return employeeToken; }
    public void setEmployeeToken(String employeeToken) { this.employeeToken = employeeToken; }
    public boolean isTestAccessEnabled() { return testAccessEnabled; }
    public void setTestAccessEnabled(boolean testAccessEnabled) { this.testAccessEnabled = testAccessEnabled; }
    public boolean isBootstrapEnabled() { return bootstrapEnabled; }
    public void setBootstrapEnabled(boolean bootstrapEnabled) { this.bootstrapEnabled = bootstrapEnabled; }
    public String getBootstrapUsername() { return bootstrapUsername; }
    public void setBootstrapUsername(String bootstrapUsername) { this.bootstrapUsername = bootstrapUsername; }
    public String getBootstrapPassword() { return bootstrapPassword; }
    public void setBootstrapPassword(String bootstrapPassword) { this.bootstrapPassword = bootstrapPassword; }
    public String getBootstrapDisplayName() { return bootstrapDisplayName; }
    public void setBootstrapDisplayName(String bootstrapDisplayName) { this.bootstrapDisplayName = bootstrapDisplayName; }
    public int getSessionHours() { return sessionHours; }
    public void setSessionHours(int sessionHours) { this.sessionHours = sessionHours; }
    public boolean isRegistrationEnabled() { return registrationEnabled; }
    public void setRegistrationEnabled(boolean registrationEnabled) { this.registrationEnabled = registrationEnabled; }
    public String getRegistrationInviteCode() { return registrationInviteCode; }
    public void setRegistrationInviteCode(String registrationInviteCode) { this.registrationInviteCode = registrationInviteCode; }
}
