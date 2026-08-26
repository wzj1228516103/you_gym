package com.yougym.api.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SyncFavoritesRequest(
        @NotBlank @Size(max = 32) String targetType,
        @NotNull @Size(max = 500) List<@NotBlank @Size(max = 128) String> ids
) {}
