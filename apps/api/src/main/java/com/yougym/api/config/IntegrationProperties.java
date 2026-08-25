package com.yougym.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "yougym.integrations")
public class IntegrationProperties {
    private String mode = "mock";
    private String testToken = "local-only";
    private boolean testEndpointsEnabled = true;
    private Sms sms = new Sms();
    private Email email = new Email();
    private Oss oss = new Oss();

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public String getTestToken() { return testToken; }
    public void setTestToken(String testToken) { this.testToken = testToken; }
    public boolean isTestEndpointsEnabled() { return testEndpointsEnabled; }
    public void setTestEndpointsEnabled(boolean testEndpointsEnabled) { this.testEndpointsEnabled = testEndpointsEnabled; }
    public Sms getSms() { return sms; }
    public void setSms(Sms sms) { this.sms = sms; }
    public Email getEmail() { return email; }
    public void setEmail(Email email) { this.email = email; }
    public Oss getOss() { return oss; }
    public void setOss(Oss oss) { this.oss = oss; }

    public static class Sms {
        private String accessKeyId;
        private String accessKeySecret;
        private String region = "cn-hangzhou";
        private String endpoint = "dysmsapi.aliyuncs.com";
        private String signName;
        private String templateCode;
        private int codeTtlMinutes = 5;
        private int sendIntervalSeconds = 60;

        public String getAccessKeyId() { return accessKeyId; }
        public void setAccessKeyId(String accessKeyId) { this.accessKeyId = accessKeyId; }
        public String getAccessKeySecret() { return accessKeySecret; }
        public void setAccessKeySecret(String accessKeySecret) { this.accessKeySecret = accessKeySecret; }
        public String getRegion() { return region; }
        public void setRegion(String region) { this.region = region; }
        public String getEndpoint() { return endpoint; }
        public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
        public String getSignName() { return signName; }
        public void setSignName(String signName) { this.signName = signName; }
        public String getTemplateCode() { return templateCode; }
        public void setTemplateCode(String templateCode) { this.templateCode = templateCode; }
        public int getCodeTtlMinutes() { return codeTtlMinutes; }
        public void setCodeTtlMinutes(int codeTtlMinutes) { this.codeTtlMinutes = codeTtlMinutes; }
        public int getSendIntervalSeconds() { return sendIntervalSeconds; }
        public void setSendIntervalSeconds(int sendIntervalSeconds) { this.sendIntervalSeconds = sendIntervalSeconds; }
    }

    public static class Email {
        private String accessKeyId;
        private String accessKeySecret;
        private String endpoint = "dm.aliyuncs.com";
        private String accountName;
        private String tagName;
        private String registerTemplateId;
        private String loginTemplateId;

        public String getAccessKeyId() { return accessKeyId; }
        public void setAccessKeyId(String accessKeyId) { this.accessKeyId = accessKeyId; }
        public String getAccessKeySecret() { return accessKeySecret; }
        public void setAccessKeySecret(String accessKeySecret) { this.accessKeySecret = accessKeySecret; }
        public String getEndpoint() { return endpoint; }
        public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
        public String getAccountName() { return accountName; }
        public void setAccountName(String accountName) { this.accountName = accountName; }
        public String getTagName() { return tagName; }
        public void setTagName(String tagName) { this.tagName = tagName; }
        public String getRegisterTemplateId() { return registerTemplateId; }
        public void setRegisterTemplateId(String registerTemplateId) { this.registerTemplateId = registerTemplateId; }
        public String getLoginTemplateId() { return loginTemplateId; }
        public void setLoginTemplateId(String loginTemplateId) { this.loginTemplateId = loginTemplateId; }
    }

    public static class Oss {
        private String endpoint;
        private String region = "cn-hangzhou";
        private String accessKeyId;
        private String accessKeySecret;
        private String bucket;
        private String publicBaseUrl;
        private String keyPrefix = "you-gym/integration-tests";
        private int signedUrlMinutes = 15;

        public String getEndpoint() { return endpoint; }
        public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
        public String getRegion() { return region; }
        public void setRegion(String region) { this.region = region; }
        public String getAccessKeyId() { return accessKeyId; }
        public void setAccessKeyId(String accessKeyId) { this.accessKeyId = accessKeyId; }
        public String getAccessKeySecret() { return accessKeySecret; }
        public void setAccessKeySecret(String accessKeySecret) { this.accessKeySecret = accessKeySecret; }
        public String getBucket() { return bucket; }
        public void setBucket(String bucket) { this.bucket = bucket; }
        public String getPublicBaseUrl() { return publicBaseUrl; }
        public void setPublicBaseUrl(String publicBaseUrl) { this.publicBaseUrl = publicBaseUrl; }
        public String getKeyPrefix() { return keyPrefix; }
        public void setKeyPrefix(String keyPrefix) { this.keyPrefix = keyPrefix; }
        public int getSignedUrlMinutes() { return signedUrlMinutes; }
        public void setSignedUrlMinutes(int signedUrlMinutes) { this.signedUrlMinutes = signedUrlMinutes; }
    }
}
