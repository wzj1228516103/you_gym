package com.yougym.api.integration;

public interface ObjectStorageGateway {
    UploadResult uploadText(String objectKey, String content);

    record UploadResult(String provider, String objectKey, String etag, String signedUrl) {}
}
