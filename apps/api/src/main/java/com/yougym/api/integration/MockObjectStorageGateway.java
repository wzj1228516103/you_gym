package com.yougym.api.integration;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class MockObjectStorageGateway implements ObjectStorageGateway {
    @Override
    public UploadResult uploadText(String objectKey, String content) {
        return new UploadResult("mock", objectKey, "mock-etag-" + UUID.randomUUID(), "http://localhost/mock/" + objectKey);
    }
}
