package com.yougym.api.integration;

public interface SmsGateway {
    SendResult sendVerificationCode(String phoneNumber, String purpose, String code);

    record SendResult(String provider, String messageId, boolean accepted) {}
}
