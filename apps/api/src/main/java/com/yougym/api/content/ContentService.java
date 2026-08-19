package com.yougym.api.content;

import com.yougym.api.anatomy.AnatomyNodeRepository;
import com.yougym.api.integration.IntegrationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.List;
import java.util.UUID;

@Service
public class ContentService {
    private final ContentRepository repository;
    private final AnatomyNodeRepository anatomyRepository;
    private final IntegrationService integrationService;

    public ContentService(ContentRepository repository, AnatomyNodeRepository anatomyRepository,
                          IntegrationService integrationService) {
        this.repository = repository;
        this.anatomyRepository = anatomyRepository;
        this.integrationService = integrationService;
    }

    public ContentRepository.ContentItem create(ContentAdminController.ContentRequest request, String actor) {
        validate(request);
        ensureAnatomyExists(request.anatomyNodeId());
        Instant now = Instant.now();
        var item = new ContentRepository.ContentItem(UUID.randomUUID().toString(), request.title().trim(), request.contentType(), "DRAFT",
                blank(request.summary()), blank(request.body()), primaryUrl(request), media(request), blank(request.anatomyNodeId()), actor, actor, now, now, null);
        repository.insert(item);
        return item;
    }

    public ContentRepository.ContentItem update(String id, ContentAdminController.ContentRequest request, String actor) {
        validate(request);
        ensureAnatomyExists(request.anatomyNodeId());
        var current = get(id);
        var item = new ContentRepository.ContentItem(current.id(), request.title().trim(), request.contentType(), current.status(),
                blank(request.summary()), blank(request.body()), primaryUrl(request), media(request), blank(request.anatomyNodeId()), current.createdBy(), actor, current.createdAt(), Instant.now(), current.publishedAt());
        repository.update(item);
        return item;
    }

    public ContentRepository.ContentItem changeStatus(String id, String status, String actor) {
        if (!java.util.Set.of("DRAFT", "PUBLISHED", "ARCHIVED").contains(status)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid content status");
        var current = get(id);
        Instant now = Instant.now();
        Instant publishedAt = "PUBLISHED".equals(status) ? (current.publishedAt() == null ? now : current.publishedAt()) : current.publishedAt();
        repository.updateStatus(id, status, actor, now, publishedAt);
        return new ContentRepository.ContentItem(current.id(), current.title(), current.contentType(), status, current.summary(), current.body(), current.mediaUrl(), current.mediaAssets(), current.anatomyNodeId(), current.createdBy(), actor, current.createdAt(), now, publishedAt);
    }

    public ContentRepository.ContentItem delete(String id) {
        var current = repository.findById(id);
        if (current == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "content not found");
        if ("PUBLISHED".equals(current.status())) throw new ResponseStatusException(HttpStatus.CONFLICT, "archive published content before deleting");
        repository.deleteById(id);
        return current;
    }

    public ContentRepository.ContentItem get(String id) {
        var item = repository.findById(id);
        if (item == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "content not found");
        return refreshMediaUrls(item);
    }

    public List<ContentRepository.ContentItem> find(String status, String contentType, String search, int limit) {
        return refreshMediaUrls(repository.find(status, contentType, search, limit));
    }

    public List<ContentRepository.ContentItem> findPublished(String contentType, String search, int limit) {
        return find("PUBLISHED", contentType, search, limit);
    }

    public List<ContentRepository.ContentItem> findPublishedByAnatomyNode(String contentType, String anatomyNodeId, int limit) {
        return refreshMediaUrls(repository.findPublishedByAnatomyNode(contentType, anatomyNodeId, limit));
    }

    private void validate(ContentAdminController.ContentRequest request) {
        if (!java.util.Set.of("ARTICLE", "VIDEO", "GIF", "MODEL_3D", "EXERCISE").contains(request.contentType())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid content type");
    }

    private void ensureAnatomyExists(String id) {
        if (id != null && !id.isBlank() && anatomyRepository.findEnabled().stream().noneMatch(node -> node.id().equals(id))) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "anatomy node not found");
    }

    private static String blank(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private static java.util.List<ContentRepository.ContentMediaAsset> media(ContentAdminController.ContentRequest request) {
        return request.mediaAssets() == null ? java.util.List.of() : request.mediaAssets().stream().limit(10).toList();
    }
    private static String primaryUrl(ContentAdminController.ContentRequest request) {
        String explicitUrl = blank(request.mediaUrl());
        if (explicitUrl != null) return explicitUrl;
        var assets = media(request);
        return assets.isEmpty() ? null : blank(assets.get(0).url());
    }

    private ContentRepository.ContentItem refreshMediaUrls(ContentRepository.ContentItem item) {
        return refreshMediaUrls(List.of(item)).get(0);
    }

    private List<ContentRepository.ContentItem> refreshMediaUrls(List<ContentRepository.ContentItem> items) {
        if (items.stream().allMatch(item -> item.mediaAssets() == null || item.mediaAssets().isEmpty())) return items;
        Map<String, com.yougym.api.integration.ObjectStorageGateway.ResolvedUrl> resolvedUrls;
        try {
            resolvedUrls = integrationService.resolveObjectUrls(items.stream()
                    .flatMap(item -> item.mediaAssets() == null ? java.util.stream.Stream.empty() : item.mediaAssets().stream())
                    .map(ContentRepository.ContentMediaAsset::objectName).distinct().toList());
        } catch (RuntimeException ignored) {
            return items;
        }
        return items.stream().map(item -> refreshMediaUrls(item, resolvedUrls)).toList();
    }

    private static ContentRepository.ContentItem refreshMediaUrls(ContentRepository.ContentItem item,
            Map<String, com.yougym.api.integration.ObjectStorageGateway.ResolvedUrl> resolvedUrls) {
        if (item.mediaAssets() == null || item.mediaAssets().isEmpty()) return item;
        List<ContentRepository.ContentMediaAsset> refreshed = item.mediaAssets().stream().map(asset -> {
            var resolved = resolvedUrls.get(asset.objectName());
            return resolved == null ? asset : new ContentRepository.ContentMediaAsset(resolved.url(), asset.objectName(),
                    asset.fileName(), asset.fileSize(), asset.fileType(), asset.fileETag());
        }).toList();
        String mediaUrl = item.mediaUrl();
        if (mediaUrl != null && mediaUrl.equals(item.mediaAssets().get(0).url())) mediaUrl = refreshed.get(0).url();
        return new ContentRepository.ContentItem(item.id(), item.title(), item.contentType(), item.status(), item.summary(),
                item.body(), mediaUrl, refreshed, item.anatomyNodeId(), item.createdBy(), item.updatedBy(),
                item.createdAt(), item.updatedAt(), item.publishedAt());
    }
}
