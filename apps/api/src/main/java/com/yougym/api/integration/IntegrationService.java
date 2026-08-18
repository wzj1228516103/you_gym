package com.yougym.api.integration;

import com.yougym.api.config.IntegrationProperties;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.Map;

@Service
public class IntegrationService {
    private final IntegrationProperties properties;
    private final MockSmsGateway mockSms;
    private final AliyunSmsGateway aliyunSms;
    private final MockEmailGateway mockEmail;
    private final AliyunEmailGateway aliyunEmail;
    private final MockObjectStorageGateway mockOss;
    private final AliyunOssGateway aliyunOss;

    public IntegrationService(IntegrationProperties properties, MockSmsGateway mockSms, AliyunSmsGateway aliyunSms,
                               MockEmailGateway mockEmail, AliyunEmailGateway aliyunEmail,
                               MockObjectStorageGateway mockOss, AliyunOssGateway aliyunOss) {
        this.properties = properties;
        this.mockSms = mockSms;
        this.aliyunSms = aliyunSms;
        this.mockEmail = mockEmail;
        this.aliyunEmail = aliyunEmail;
        this.mockOss = mockOss;
        this.aliyunOss = aliyunOss;
    }

    public SmsGateway.SendResult sendSms(String phoneNumber, String purpose) {
        return sms().sendVerificationCode(phoneNumber, purpose);
    }

    public EmailGateway.SendResult sendEmail(String email, String purpose) {
        return email().sendVerificationCode(email, purpose);
    }

    public ObjectStorageGateway.UploadResult uploadText(String objectKey, String content) {
        return oss().uploadText(objectKey, content);
    }

    public ObjectStorageGateway.UploadResult upload(String objectKey, InputStream input, long contentLength, String contentType) throws IOException {
        return oss().upload(objectKey, input, contentLength, contentType);
    }

    public ObjectStorageGateway.ResolvedUrl resolveObjectUrl(String objectKey) {
        return oss().resolveUrl(objectKey);
    }

    public Map<String, ObjectStorageGateway.ResolvedUrl> resolveObjectUrls(Collection<String> objectKeys) {
        return oss().resolveUrls(objectKeys);
    }

    public boolean isMock() { return !"aliyun".equalsIgnoreCase(properties.getMode()); }

    private SmsGateway sms() { return isMock() ? mockSms : aliyunSms; }
    private EmailGateway email() { return isMock() ? mockEmail : aliyunEmail; }
    private ObjectStorageGateway oss() { return isMock() ? mockOss : aliyunOss; }
}
