package com.yougym.api.integration;

import com.yougym.api.config.IntegrationProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/integrations")
public class IntegrationController {
    private final IntegrationProperties properties;
    private final IntegrationService service;

    public IntegrationController(IntegrationProperties properties, IntegrationService service) {
        this.properties = properties;
        this.service = service;
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("mode", properties.getMode());
        result.put("smsConfigured", has(properties.getSms().getAccessKeyId()) && has(properties.getSms().getTemplateCode()));
        result.put("emailConfigured", has(properties.getEmail().getAccessKeyId()) && has(properties.getEmail().getAccountName()));
        result.put("ossConfigured", has(properties.getOss().getEndpoint()) && has(properties.getOss().getBucket()));
        result.put("externalCallsEnabled", !service.isMock());
        return result;
    }

    @PostMapping("/sms/test")
    public Map<String, Object> testSms(@Valid @RequestBody SmsTestRequest request,
                                       @RequestHeader(value = "X-Integration-Test-Token", required = false) String token,
                                       @RequestHeader(value = "X-Confirm-External-Send", required = false) String confirm) {
        authorize(token);
        requireExternalConfirmation(confirm);
        SmsGateway.SendResult result = service.sendSms(request.phoneNumber(), request.purpose());
        return Map.of("accepted", result.accepted(), "provider", result.provider(), "messageId", result.messageId());
    }

    @PostMapping("/email/test")
    public Map<String, Object> testEmail(@Valid @RequestBody EmailTestRequest request,
                                         @RequestHeader(value = "X-Integration-Test-Token", required = false) String token,
                                         @RequestHeader(value = "X-Confirm-External-Send", required = false) String confirm) {
        authorize(token);
        requireExternalConfirmation(confirm);
        EmailGateway.SendResult result = service.sendEmail(request.email(), request.purpose());
        return Map.of("accepted", result.accepted(), "provider", result.provider(), "messageId", result.messageId());
    }

    @PostMapping("/oss/test")
    public Map<String, Object> testOss(@Valid @RequestBody OssTestRequest request,
                                       @RequestHeader(value = "X-Integration-Test-Token", required = false) String token,
                                       @RequestHeader(value = "X-Confirm-External-Send", required = false) String confirm) {
        authorize(token);
        requireExternalConfirmation(confirm);
        ObjectStorageGateway.UploadResult result = service.uploadText(request.objectKey(), request.content());
        return Map.of("provider", result.provider(), "objectKey", result.objectKey(), "etag", result.etag(), "signedUrl", result.signedUrl());
    }

    private void authorize(String token) {
        if (token == null || !token.equals(properties.getTestToken())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid integration test token");
        }
    }

    private void requireExternalConfirmation(String confirmation) {
        if (!service.isMock() && !"true".equalsIgnoreCase(confirmation)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "set X-Confirm-External-Send: true for real provider calls");
        }
    }

    private static boolean has(String value) { return value != null && !value.isBlank(); }

    public record SmsTestRequest(@NotBlank @Pattern(regexp = "^\\+?[0-9]{6,20}$") String phoneNumber, @NotBlank String purpose) {}
    public record EmailTestRequest(@NotBlank @Email String email, @NotBlank String purpose) {}
    public record OssTestRequest(@NotBlank String objectKey, @NotBlank String content) {}
}
