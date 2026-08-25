package com.yougym.api.integration;

public interface EmailGateway {
    SendResult sendVerificationCode(String email, String purpose);

    record SendResult(String provider, String messageId, boolean accepted) {}
}
