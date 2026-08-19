package com.yougym.api.user.vo;

public record SessionVO(String accessToken, String tokenType, long expiresInSeconds, AppUserVO user, boolean needsOnboarding) {}
