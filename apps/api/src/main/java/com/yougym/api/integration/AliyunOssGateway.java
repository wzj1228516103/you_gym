package com.yougym.api.integration;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.aliyun.oss.model.GeneratePresignedUrlRequest;
import com.aliyun.oss.model.ObjectMetadata;
import com.aliyun.oss.model.PutObjectResult;
import com.yougym.api.config.IntegrationProperties;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.net.URL;
import java.util.Date;

@Component
public class AliyunOssGateway implements ObjectStorageGateway {
    private final IntegrationProperties properties;

    public AliyunOssGateway(IntegrationProperties properties) {
        this.properties = properties;
    }

    @Override
    public UploadResult uploadText(String objectKey, String content) {
        IntegrationProperties.Oss config = properties.getOss();
        require(config.getEndpoint(), "OSS endpoint");
        require(config.getAccessKeyId(), "OSS access key id");
        require(config.getAccessKeySecret(), "OSS access key secret");
        require(config.getBucket(), "OSS bucket");
        String key = config.getKeyPrefix() + "/" + objectKey.replaceAll("[^a-zA-Z0-9._/-]", "_");

        OSS client = new OSSClientBuilder().build(config.getEndpoint(), config.getAccessKeyId(), config.getAccessKeySecret());
        try {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType("text/plain; charset=utf-8");
            PutObjectResult result = client.putObject(config.getBucket(), key,
                    new ByteArrayInputStream(content.getBytes(java.nio.charset.StandardCharsets.UTF_8)), metadata);
            Date expires = new Date(System.currentTimeMillis() + config.getSignedUrlMinutes() * 60_000L);
            GeneratePresignedUrlRequest signedRequest = new GeneratePresignedUrlRequest(config.getBucket(), key);
            signedRequest.setExpiration(expires);
            URL signedUrl = client.generatePresignedUrl(signedRequest);
            return new UploadResult("aliyun-oss", key, result.getETag(), signedUrl.toString());
        } catch (Exception e) {
            throw new IntegrationProviderException("Aliyun OSS request failed", e);
        } finally {
            client.shutdown();
        }
    }

    private static void require(String value, String name) {
        if (value == null || value.isBlank()) throw new IntegrationProviderException(name + " is not configured");
    }
}
