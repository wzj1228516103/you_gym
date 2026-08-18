package com.yougym.api.integration;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class MockObjectStorageGateway implements ObjectStorageGateway {
    private final Map<String, StoredObject> objects = new ConcurrentHashMap<>();

    @Override
    public UploadResult uploadText(String objectKey, String content) {
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        objects.put(objectKey, new StoredObject(bytes, "text/plain; charset=utf-8"));
        return result(objectKey);
    }

    @Override
    public UploadResult upload(String objectKey, InputStream input, long contentLength, String contentType) throws IOException {
        objects.put(objectKey, new StoredObject(input.readAllBytes(), contentType));
        return result(objectKey);
    }

    @Override
    public ResolvedUrl resolveUrl(String objectKey) {
        if (!objects.containsKey(objectKey)) throw new IntegrationProviderException("Mock object does not exist");
        return new ResolvedUrl(previewUrl(objectKey), 0);
    }

    public StoredObject find(String objectKey) { return objects.get(objectKey); }

    private UploadResult result(String objectKey) {
        return new UploadResult("mock", objectKey, "mock-etag-" + UUID.randomUUID(),
                previewUrl(objectKey), 0);
    }

    private static String previewUrl(String objectKey) {
        return "/api/file/mock-media?objectKey=" + URLEncoder.encode(objectKey, StandardCharsets.UTF_8);
    }

    public record StoredObject(byte[] bytes, String contentType) {}
}
