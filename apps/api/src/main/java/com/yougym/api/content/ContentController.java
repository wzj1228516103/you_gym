package com.yougym.api.content;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/content")
public class ContentController {
    private final ContentService service;

    public ContentController(ContentService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam(defaultValue = "EXERCISE") String contentType,
                                    @RequestParam(required = false) String search,
                                    @RequestParam(required = false) String anatomyNodeId,
                                    @RequestParam(defaultValue = "50") int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        var source = anatomyNodeId == null || anatomyNodeId.isBlank()
                ? service.findPublished(contentType, search, safeLimit)
                : service.findPublishedByAnatomyNode(contentType, anatomyNodeId, safeLimit);
        List<Map<String, Object>> items = source.stream()
                .map(ContentController::publicItem)
                .toList();
        return Map.of("items", items);
    }

    private static Map<String, Object> publicItem(ContentRepository.ContentItem item) {
        return Map.ofEntries(
                Map.entry("id", item.id()), Map.entry("title", item.title()), Map.entry("contentType", item.contentType()),
                Map.entry("summary", item.summary() == null ? "" : item.summary()), Map.entry("body", item.body() == null ? "" : item.body()),
                Map.entry("mediaUrl", item.mediaUrl() == null ? "" : item.mediaUrl()), Map.entry("mediaAssets", item.mediaAssets() == null ? List.of() : item.mediaAssets()),
                Map.entry("anatomyNodeId", item.anatomyNodeId() == null ? "" : item.anatomyNodeId()),
                Map.entry("publishedAt", item.publishedAt() == null ? "" : item.publishedAt().toString()));
    }
}
