package com.yougym.api.exercise.service;

import com.yougym.api.integration.IntegrationService;
import com.yougym.api.integration.ObjectStorageGateway;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Resolves uploaded exercise assets while leaving bundled and external URLs unchanged. */
@Component
public class ExerciseMediaUrlResolver {
    private final IntegrationService integrationService;

    public ExerciseMediaUrlResolver(IntegrationService integrationService) {
        this.integrationService = integrationService;
    }

    public List<Map<String, Object>> resolveMany(Collection<Map<String, Object>> items) {
        if (items == null || items.isEmpty()) return List.of();
        Set<String> objectNames = new LinkedHashSet<>();
        for (Map<String, Object> item : items) {
            collectResources(item, objectNames);
        }
        if (objectNames.isEmpty()) return items.stream().map(ExerciseMediaUrlResolver::copy).toList();
        Map<String, ObjectStorageGateway.ResolvedUrl> resolved;
        try {
            resolved = integrationService.resolveObjectUrls(objectNames);
        } catch (RuntimeException ignored) {
            return items.stream().map(ExerciseMediaUrlResolver::copy).toList();
        }
        return items.stream().map(item -> resolveOne(item, resolved)).toList();
    }

    public Map<String, Object> resolveOne(Map<String, Object> item) {
        return resolveMany(List.of(item)).get(0);
    }

    private static void collectResources(Map<String, Object> item, Set<String> objectNames) {
        if (item == null || !(item.get("resources") instanceof Iterable<?> resources)) return;
        for (Object resource : resources) {
            if (!(resource instanceof Map<?, ?> map)) continue;
            Object url = map.get("resourceUrl");
            if (isObjectName(url)) objectNames.add(String.valueOf(url));
        }
    }

    private static Map<String, Object> resolveOne(Map<String, Object> item,
                                                   Map<String, ObjectStorageGateway.ResolvedUrl> resolved) {
        if (item == null) return Map.of();
        Map<String, Object> result = new LinkedHashMap<>(item);
        if (!(item.get("resources") instanceof Iterable<?> resources)) return result;
        List<Map<String, Object>> refreshed = new ArrayList<>();
        for (Object resource : resources) {
            if (!(resource instanceof Map<?, ?> map)) continue;
            Map<String, Object> copy = new LinkedHashMap<>();
            map.forEach((key, value) -> copy.put(String.valueOf(key), value));
            Object url = copy.get("resourceUrl");
            ObjectStorageGateway.ResolvedUrl resolvedUrl = url == null ? null : resolved.get(String.valueOf(url));
            if (resolvedUrl != null) copy.put("resourceUrl", resolvedUrl.url());
            refreshed.add(copy);
        }
        result.put("resources", refreshed);
        return result;
    }

    private static Map<String, Object> copy(Map<String, Object> item) {
        return item == null ? Map.of() : new LinkedHashMap<>(item);
    }

    private static boolean isObjectName(Object value) {
        if (value == null) return false;
        String text = String.valueOf(value).trim();
        if (text.isBlank() || text.contains("://") || text.startsWith("/")) return false;
        return text.startsWith("content/") || text.contains("/content/");
    }
}
