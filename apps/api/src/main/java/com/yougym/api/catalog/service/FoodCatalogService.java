package com.yougym.api.catalog.service;

import com.yougym.api.catalog.mapper.FoodCatalogMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class FoodCatalogService {
    private static final java.util.Set<String> STATUSES = java.util.Set.of("ACTIVE", "INACTIVE");
    private final FoodCatalogMapper mapper;
    private final FoodMediaUrlResolver mediaUrlResolver;

    public FoodCatalogService(FoodCatalogMapper mapper, FoodMediaUrlResolver mediaUrlResolver) {
        this.mapper = mapper;
        this.mediaUrlResolver = mediaUrlResolver;
    }

    public List<Map<String, Object>> find(String search, String status, int limit) {
        if (status != null && !status.isBlank() && !STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid food status");
        }
        return mediaUrlResolver.resolveMany(mapper.find(search, status, Math.max(1, Math.min(limit, 500))));
    }

    public Map<String, Object> create(String requestedId, String name, String serving, BigDecimal calories,
                                      BigDecimal protein, BigDecimal carbs, BigDecimal fat, String source,
                                      String requestedStatus, String mediaUrl, List<MediaAsset> mediaAssets) {
        String id = requestedId == null || requestedId.isBlank() ? "food-" + UUID.randomUUID() : requestedId.trim();
        validateId(id);
        String status = normalizeStatus(requestedStatus);
        if (mapper.exists(id)) throw new ResponseStatusException(HttpStatus.CONFLICT, "food id already exists");
        Instant now = Instant.now();
        List<MediaAsset> assets = normalizeMedia(mediaAssets);
        mapper.insert(id, normalize(name, "name"), normalize(serving, "serving"), calories, protein, carbs, fat,
                normalize(source, "source"), status, primaryUrl(mediaUrl, assets), assets, now);
        return mediaUrlResolver.resolveOne(mapper.findById(id));
    }

    public Map<String, Object> update(String id, String name, String serving, BigDecimal calories,
                                      BigDecimal protein, BigDecimal carbs, BigDecimal fat, String source) {
        return update(id, name, serving, calories, protein, carbs, fat, source, null, List.of());
    }

    public Map<String, Object> update(String id, String name, String serving, BigDecimal calories,
                                      BigDecimal protein, BigDecimal carbs, BigDecimal fat, String source,
                                      String mediaUrl, List<MediaAsset> mediaAssets) {
        requireExisting(id);
        Instant now = Instant.now();
        List<MediaAsset> assets = normalizeMedia(mediaAssets);
        mapper.update(id, normalize(name, "name"), normalize(serving, "serving"), calories, protein, carbs, fat,
                normalize(source, "source"), primaryUrl(mediaUrl, assets), assets, now);
        return mediaUrlResolver.resolveOne(mapper.findById(id));
    }

    public Map<String, Object> changeStatus(String id, String status) {
        requireExisting(id);
        String normalized = normalizeStatus(status);
        mapper.updateStatus(id, normalized, Instant.now());
        return mediaUrlResolver.resolveOne(mapper.findById(id));
    }

    public void delete(String id) {
        requireExisting(id);
        if (!mapper.delete(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "food not found");
    }

    public boolean isMediaObjectReferenced(String objectName) {
        return mapper.isMediaObjectReferenced(objectName);
    }

    private void requireExisting(String id) {
        if (id == null || id.isBlank() || !mapper.exists(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "food not found");
    }

    private static String normalizeStatus(String value) {
        String status = value == null || value.isBlank() ? "ACTIVE" : value.trim().toUpperCase();
        if (!STATUSES.contains(status)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid food status");
        return status;
    }

    private static String normalize(String value, String field) {
        if (value == null || value.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " is required");
        return value.trim();
    }

    private static void validateId(String id) {
        if (!id.matches("[A-Za-z0-9][A-Za-z0-9_-]{0,63}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id must contain only letters, numbers, _ or -");
        }
    }

    private static List<MediaAsset> normalizeMedia(List<MediaAsset> mediaAssets) {
        return mediaAssets == null ? List.of() : mediaAssets.stream().filter(asset -> asset != null && asset.url() != null && !asset.url().isBlank()).limit(10).toList();
    }

    private static String primaryUrl(String mediaUrl, List<MediaAsset> assets) {
        if (mediaUrl != null && !mediaUrl.isBlank()) return mediaUrl.trim();
        return assets.isEmpty() ? null : assets.get(0).url();
    }

    public record MediaAsset(String url, String objectName, String fileName, long fileSize,
                             String fileType, String fileETag, Integer expiresIn) {}
}
