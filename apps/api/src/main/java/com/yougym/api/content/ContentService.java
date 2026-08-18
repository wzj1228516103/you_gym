package com.yougym.api.content;

import com.yougym.api.anatomy.AnatomyNodeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@Service
public class ContentService {
    private final ContentRepository repository;
    private final AnatomyNodeRepository anatomyRepository;

    public ContentService(ContentRepository repository, AnatomyNodeRepository anatomyRepository) {
        this.repository = repository;
        this.anatomyRepository = anatomyRepository;
    }

    public ContentRepository.ContentItem create(ContentAdminController.ContentRequest request, String actor) {
        validate(request);
        ensureAnatomyExists(request.anatomyNodeId());
        Instant now = Instant.now();
        var item = new ContentRepository.ContentItem(UUID.randomUUID().toString(), request.title().trim(), request.contentType(), "DRAFT",
                blank(request.summary()), blank(request.body()), blank(request.mediaUrl()), blank(request.anatomyNodeId()), actor, actor, now, now, null);
        repository.insert(item);
        return item;
    }

    public ContentRepository.ContentItem update(String id, ContentAdminController.ContentRequest request, String actor) {
        validate(request);
        ensureAnatomyExists(request.anatomyNodeId());
        var current = get(id);
        var item = new ContentRepository.ContentItem(current.id(), request.title().trim(), request.contentType(), current.status(),
                blank(request.summary()), blank(request.body()), blank(request.mediaUrl()), blank(request.anatomyNodeId()), current.createdBy(), actor, current.createdAt(), Instant.now(), current.publishedAt());
        repository.update(item);
        return item;
    }

    public ContentRepository.ContentItem changeStatus(String id, String status, String actor) {
        if (!java.util.Set.of("DRAFT", "PUBLISHED", "ARCHIVED").contains(status)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid content status");
        var current = get(id);
        Instant now = Instant.now();
        Instant publishedAt = "PUBLISHED".equals(status) ? (current.publishedAt() == null ? now : current.publishedAt()) : current.publishedAt();
        repository.updateStatus(id, status, actor, now, publishedAt);
        return new ContentRepository.ContentItem(current.id(), current.title(), current.contentType(), status, current.summary(), current.body(), current.mediaUrl(), current.anatomyNodeId(), current.createdBy(), actor, current.createdAt(), now, publishedAt);
    }

    public ContentRepository.ContentItem get(String id) {
        var item = repository.findById(id);
        if (item == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "content not found");
        return item;
    }

    private void validate(ContentAdminController.ContentRequest request) {
        if (!java.util.Set.of("ARTICLE", "VIDEO", "GIF", "MODEL_3D", "EXERCISE").contains(request.contentType())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid content type");
    }

    private void ensureAnatomyExists(String id) {
        if (id != null && !id.isBlank() && anatomyRepository.findEnabled().stream().noneMatch(node -> node.id().equals(id))) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "anatomy node not found");
    }

    private static String blank(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
