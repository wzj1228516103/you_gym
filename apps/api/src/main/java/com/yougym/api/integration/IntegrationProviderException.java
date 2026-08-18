package com.yougym.api.integration;

public class IntegrationProviderException extends RuntimeException {
    public IntegrationProviderException(String message) { super(message); }
    public IntegrationProviderException(String message, Throwable cause) { super(message, cause); }
}
