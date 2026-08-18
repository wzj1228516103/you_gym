package com.yougym.api.integration;

import com.aliyun.dm20151123.Client;
import com.aliyun.dm20151123.models.SingleSendMailRequest;
import com.aliyun.dm20151123.models.SingleSendMailRequest.SingleSendMailRequestTemplate;
import com.aliyun.tea.TeaPair;
import com.aliyun.tea.TeaConverter;
import com.aliyun.teaopenapi.models.Config;
import com.aliyun.teautil.models.RuntimeOptions;
import com.yougym.api.config.IntegrationProperties;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AliyunEmailGateway implements EmailGateway {
    private final IntegrationProperties properties;

    public AliyunEmailGateway(IntegrationProperties properties) {
        this.properties = properties;
    }

    @Override
    public SendResult sendVerificationCode(String email, String purpose) {
        IntegrationProperties.Email config = properties.getEmail();
        require(config.getAccessKeyId(), "email access key id");
        require(config.getAccessKeySecret(), "email access key secret");
        require(config.getAccountName(), "email account name");
        String templateId = "register".equalsIgnoreCase(purpose) ? config.getRegisterTemplateId() : config.getLoginTemplateId();
        require(templateId, "email template id");

        try {
            Config clientConfig = new Config()
                    .setAccessKeyId(config.getAccessKeyId())
                    .setAccessKeySecret(config.getAccessKeySecret());
            clientConfig.endpoint = config.getEndpoint();
            Client client = new Client(clientConfig);
            SingleSendMailRequestTemplate template = new SingleSendMailRequestTemplate()
                    .setTemplateId(templateId)
                    .setTemplateData(TeaConverter.buildMap(new TeaPair("captcha", "TEST_CODE")));
            SingleSendMailRequest request = new SingleSendMailRequest()
                    .setTemplate(template)
                    .setAccountName(config.getAccountName())
                    .setAddressType(1)
                    .setTagName(config.getTagName())
                    .setReplyToAddress(true)
                    .setToAddress(email)
                    .setSubject("YOU GYM verification code");
            client.singleSendMailWithOptions(request, new RuntimeOptions());
            return new SendResult("aliyun-directmail", "accepted", true);
        } catch (Exception e) {
            throw new IntegrationProviderException("Aliyun email request failed", e);
        }
    }

    private static void require(String value, String name) {
        if (value == null || value.isBlank()) throw new IntegrationProviderException(name + " is not configured");
    }
}
