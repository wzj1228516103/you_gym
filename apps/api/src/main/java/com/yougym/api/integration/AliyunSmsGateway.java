package com.yougym.api.integration;

import com.aliyun.auth.credentials.Credential;
import com.aliyun.auth.credentials.provider.StaticCredentialProvider;
import com.aliyun.sdk.service.dysmsapi20170525.AsyncClient;
import com.aliyun.sdk.service.dysmsapi20170525.models.SendSmsRequest;
import com.aliyun.sdk.service.dysmsapi20170525.models.SendSmsResponse;
import com.yougym.api.config.IntegrationProperties;
import darabonba.core.client.ClientOverrideConfiguration;
import org.springframework.stereotype.Component;

@Component
public class AliyunSmsGateway implements SmsGateway {
    private final IntegrationProperties properties;

    public AliyunSmsGateway(IntegrationProperties properties) {
        this.properties = properties;
    }

    @Override
    public SendResult sendVerificationCode(String phoneNumber, String purpose) {
        IntegrationProperties.Sms sms = properties.getSms();
        require(sms.getAccessKeyId(), "SMS access key id");
        require(sms.getAccessKeySecret(), "SMS access key secret");
        require(sms.getSignName(), "SMS sign name");
        require(sms.getTemplateCode(), "SMS template code");

        String code = String.format("%06d", new java.security.SecureRandom().nextInt(1_000_000));
        StaticCredentialProvider provider = StaticCredentialProvider.create(Credential.builder()
                .accessKeyId(sms.getAccessKeyId())
                .accessKeySecret(sms.getAccessKeySecret())
                .build());
        AsyncClient client = AsyncClient.builder()
                .region(sms.getRegion())
                .credentialsProvider(provider)
                .overrideConfiguration(ClientOverrideConfiguration.create().setEndpointOverride(sms.getEndpoint()))
                .build();
        try {
            SendSmsResponse response = client.sendSms(SendSmsRequest.builder()
                    .phoneNumbers(phoneNumber)
                    .signName(sms.getSignName())
                    .templateCode(sms.getTemplateCode())
                    .templateParam("{\"code\":\"" + code + "\"}")
                    .build()).get();
            if (response == null || response.getBody() == null || !"OK".equals(response.getBody().getCode())) {
                throw new IntegrationProviderException("Aliyun SMS rejected the request");
            }
            return new SendResult("aliyun-sms", response.getBody().getBizId(), true);
        } catch (IntegrationProviderException e) {
            throw e;
        } catch (Exception e) {
            throw new IntegrationProviderException("Aliyun SMS request failed", e);
        } finally {
            client.close();
        }
    }

    private static void require(String value, String name) {
        if (value == null || value.isBlank()) throw new IntegrationProviderException(name + " is not configured");
    }
}
