package com.yougym.api.integration;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;

public interface ObjectStorageGateway {
    UploadResult uploadText(String objectKey, String content);
    UploadResult upload(String objectKey, InputStream input, long contentLength, String contentType) throws IOException;
    ResolvedUrl resolveUrl(String objectKey);
    default Map<String, ResolvedUrl> resolveUrls(Collection<String> objectKeys) {
        Map<String, ResolvedUrl> result = new LinkedHashMap<>();
        for (String objectKey : objectKeys) {
            try { result.put(objectKey, resolveUrl(objectKey)); }
            catch (RuntimeException ignored) { }
        }
        return result;
    }

    record UploadResult(String provider, String objectKey, String etag, String signedUrl, long expiresInSeconds) {}
    record ResolvedUrl(String url, long expiresInSeconds) {}
}
