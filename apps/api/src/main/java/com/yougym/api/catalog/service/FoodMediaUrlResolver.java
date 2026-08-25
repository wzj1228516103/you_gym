package com.yougym.api.catalog.service;

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

/** Refreshes short-lived object-storage URLs without changing persisted catalog data. */
@Component
public class FoodMediaUrlResolver {
    private final IntegrationService integrationService;

    public FoodMediaUrlResolver(IntegrationService integrationService) {
        this.integrationService = integrationService;
    }

    public List<Map<String, Object>> resolveMany(Collection<Map<String, Object>> items) {
        if (items == null || items.isEmpty()) return List.of();

        Set<String> objectNames = new LinkedHashSet<>();
        for (Map<String, Object> item : items) collectObjectNames(item, objectNames);
        if (objectNames.isEmpty()) return items.stream().map(FoodMediaUrlResolver::copyItem).toList();

        Map<String, ObjectStorageGateway.ResolvedUrl> resolved;
        try {
            resolved = integrationService.resolveObjectUrls(objectNames);
        } catch (RuntimeException ignored) {
            return items.stream().map(FoodMediaUrlResolver::copyItem).toList();
        }
        return items.stream().map(item -> resolveOne(item, resolved)).toList();
    }

    public Map<String, Object> resolveOne(Map<String, Object> item) {
        return resolveMany(List.of(item)).get(0);
    }

    private static void collectObjectNames(Map<String, Object> item, Set<String> objectNames) {
        if (item == null) return;
        Object mediaUrl = item.get("mediaUrl");
        if (isLikelyObjectName(mediaUrl)) objectNames.add(String.valueOf(mediaUrl));
        Object assets = item.get("mediaAssets");
        if (!(assets instanceof Iterable<?> iterable)) return;
        for (Object asset : iterable) {
            if (!(asset instanceof Map<?, ?> map)) continue;
            Object objectName = map.get("objectName");
            if (objectName != null && !String.valueOf(objectName).isBlank()) objectNames.add(String.valueOf(objectName));
        }
    }

    private static Map<String, Object> resolveOne(Map<String, Object> item,
                                                   Map<String, ObjectStorageGateway.ResolvedUrl> resolved) {
        if (item == null) return Map.of();
        Map<String, Object> result = new LinkedHashMap<>(item);
        Object originalMediaUrl = item.get("mediaUrl");
        List<Map<String, Object>> originalAssets = mediaAssets(item.get("mediaAssets"));
        List<Map<String, Object>> refreshedAssets = new ArrayList<>(originalAssets.size());
        for (Map<String, Object> asset : originalAssets) {
            Map<String, Object> refreshed = new LinkedHashMap<>(asset);
            Object objectName = asset.get("objectName");
            ObjectStorageGateway.ResolvedUrl url = objectName == null ? null : resolved.get(String.valueOf(objectName));
            if (url != null) refreshed.put("url", url.url());
            refreshedAssets.add(refreshed);
        }
        if (!originalAssets.isEmpty()) {
            result.put("mediaAssets", refreshedAssets);
            String oldPrimary = stringValue(originalAssets.get(0).get("url"));
            if (originalMediaUrl != null && (String.valueOf(originalMediaUrl).equals(oldPrimary)
                    || String.valueOf(originalMediaUrl).equals(stringValue(originalAssets.get(0).get("objectName"))))) {
                String refreshedPrimary = stringValue(refreshedAssets.get(0).get("url"));
                if (refreshedPrimary != null) result.put("mediaUrl", refreshedPrimary);
            }
        } else if (isLikelyObjectName(originalMediaUrl)) {
            ObjectStorageGateway.ResolvedUrl url = resolved.get(String.valueOf(originalMediaUrl));
            if (url != null) result.put("mediaUrl", url.url());
        }
        return result;
    }

    private static Map<String, Object> copyItem(Map<String, Object> item) {
        return item == null ? Map.of() : new LinkedHashMap<>(item);
    }

    private static List<Map<String, Object>> mediaAssets(Object value) {
        if (!(value instanceof Iterable<?> iterable)) return List.of();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object asset : iterable) {
            if (asset instanceof Map<?, ?> map) {
                Map<String, Object> copy = new LinkedHashMap<>();
                map.forEach((key, item) -> copy.put(String.valueOf(key), item));
                result.add(copy);
            }
        }
        return result;
    }

    private static boolean isLikelyObjectName(Object value) {
        if (value == null) return false;
        String text = String.valueOf(value).trim();
        return !text.isBlank() && !text.contains("://") && (text.startsWith("content/") || text.startsWith("food/"));
    }

    private static String stringValue(Object value) {
        if (value == null) return null;
        String text = String.valueOf(value);
        return text.isBlank() ? null : text;
    }
}
