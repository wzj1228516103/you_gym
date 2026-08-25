package com.yougym.api.integration;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.aliyun.oss.model.GeneratePresignedUrlRequest;
import com.aliyun.oss.model.ObjectMetadata;
import com.aliyun.oss.model.PutObjectResult;
import com.yougym.api.config.IntegrationProperties;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Collection;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class AliyunOssGateway implements ObjectStorageGateway {
    private final IntegrationProperties properties;

    public AliyunOssGateway(IntegrationProperties properties) {
        this.properties = properties;
    }

    @Override
    public UploadResult uploadText(String objectKey, String content) {
        byte[] bytes = content.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        try {
            return upload(objectKey, new ByteArrayInputStream(bytes), bytes.length, "text/plain; charset=utf-8");
        } catch (IOException impossible) {
            throw new IntegrationProviderException("Aliyun OSS request failed", impossible);
        }
    }

    @Override
    public UploadResult upload(String objectKey, InputStream input, long contentLength, String contentType) throws IOException {
        IntegrationProperties.Oss config = properties.getOss();
        require(config.getEndpoint(), "OSS endpoint");
        require(config.getAccessKeyId(), "OSS access key id");
        require(config.getAccessKeySecret(), "OSS access key secret");
        require(config.getBucket(), "OSS bucket");
        String prefix = config.getKeyPrefix() == null || config.getKeyPrefix().isBlank()
                ? "" : config.getKeyPrefix().replaceAll("/+$", "") + "/";
        String key = prefix + objectKey.replaceAll("[^a-zA-Z0-9._/-]", "_");

        OSS client = new OSSClientBuilder().build(config.getEndpoint(), config.getAccessKeyId(), config.getAccessKeySecret());
        try {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(contentLength);
            metadata.setContentType(contentType == null || contentType.isBlank() ? "application/octet-stream" : contentType);
            PutObjectResult result = client.putObject(config.getBucket(), key, input, metadata);
            ResolvedUrl resolved = resolveUrl(client, config, key);
            return new UploadResult("aliyun-oss", key, result.getETag(), resolved.url(), resolved.expiresInSeconds());
        } catch (Exception e) {
            throw new IntegrationProviderException("Aliyun OSS request failed", e);
        } finally {
            client.shutdown();
        }
    }

    @Override
    public ResolvedUrl resolveUrl(String objectKey) {
        ResolvedUrl resolved = resolveUrls(java.util.List.of(objectKey)).get(objectKey);
        if (resolved == null) throw new IntegrationProviderException("OSS object key cannot be resolved");
        return resolved;
    }

    @Override
    public boolean delete(String objectKey) {
        IntegrationProperties.Oss config = configuredOss();
        validateObjectKey(config, objectKey);
        OSS client = new OSSClientBuilder().build(config.getEndpoint(), config.getAccessKeyId(), config.getAccessKeySecret());
        try {
            client.deleteObject(config.getBucket(), objectKey);
            return true;
        } catch (Exception e) {
            throw new IntegrationProviderException("Aliyun OSS delete failed", e);
        } finally {
            client.shutdown();
        }
    }

    @Override
    public Map<String, ResolvedUrl> resolveUrls(Collection<String> objectKeys) {
        IntegrationProperties.Oss config = configuredOss();
        OSS client = new OSSClientBuilder().build(config.getEndpoint(), config.getAccessKeyId(), config.getAccessKeySecret());
        try {
            Map<String, ResolvedUrl> resolved = new LinkedHashMap<>();
            for (String objectKey : objectKeys) {
                if (objectKey == null || objectKey.isBlank()) continue;
                if (!isObjectKeyAllowed(config, objectKey)) continue;
                resolved.put(objectKey, resolveUrl(client, config, objectKey));
            }
            return resolved;
        } catch (Exception e) {
            throw new IntegrationProviderException("Aliyun OSS URL generation failed", e);
        } finally {
            client.shutdown();
        }
    }

    private static ResolvedUrl resolveUrl(OSS client, IntegrationProperties.Oss config, String key) {
        boolean publicUrl = config.getPublicBaseUrl() != null && !config.getPublicBaseUrl().isBlank();
        if (publicUrl) {
            return new ResolvedUrl(config.getPublicBaseUrl().replaceAll("/+$", "") + "/" + key, 0);
        }
        Date expires = new Date(System.currentTimeMillis() + config.getSignedUrlMinutes() * 60_000L);
        GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(config.getBucket(), key);
        request.setExpiration(expires);
        URL signedUrl = client.generatePresignedUrl(request);
        return new ResolvedUrl(signedUrl.toString(), config.getSignedUrlMinutes() * 60L);
    }

    private IntegrationProperties.Oss configuredOss() {
        IntegrationProperties.Oss config = properties.getOss();
        require(config.getEndpoint(), "OSS endpoint");
        require(config.getAccessKeyId(), "OSS access key id");
        require(config.getAccessKeySecret(), "OSS access key secret");
        require(config.getBucket(), "OSS bucket");
        return config;
    }

    private static void validateObjectKey(IntegrationProperties.Oss config, String objectKey) {
        if (!isObjectKeyAllowed(config, objectKey)) throw new IntegrationProviderException("OSS object key is outside the configured prefix");
    }

    private static boolean isObjectKeyAllowed(IntegrationProperties.Oss config, String objectKey) {
        String prefix = config.getKeyPrefix() == null || config.getKeyPrefix().isBlank()
                ? "" : config.getKeyPrefix().replaceAll("/+$", "") + "/";
        return !prefix.isEmpty() ? objectKey.startsWith(prefix) : !objectKey.startsWith("/");
    }

    private static void require(String value, String name) {
        if (value == null || value.isBlank()) throw new IntegrationProviderException(name + " is not configured");
    }
}
