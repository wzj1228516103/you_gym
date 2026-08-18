package com.yougym.api.integration;

import org.springframework.stereotype.Component;

@Component
public class MockEmailGateway implements EmailGateway {
    @Override
    public SendResult sendVerificationCode(String email, String purpose) {
        return new SendResult("mock", "mock-email-accepted", true);
    }
}
