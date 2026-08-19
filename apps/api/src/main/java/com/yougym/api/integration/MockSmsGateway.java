package com.yougym.api.integration;

import org.springframework.stereotype.Component;

@Component
public class MockSmsGateway implements SmsGateway {
    @Override
    public SendResult sendVerificationCode(String phoneNumber, String purpose, String code) {
        return new SendResult("mock", "mock-sms-accepted", true);
    }
}
