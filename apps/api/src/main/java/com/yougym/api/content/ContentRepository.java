package com.yougym.api.content;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Repository
public class ContentRepository {
    private static final TypeReference<List<ContentMediaAsset>> MEDIA_LIST = new TypeReference<>() {};
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public ContentRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public List<ContentItem> find(String status, String contentType, String search, int limit) {
        StringBuilder sql = new StringBuilder("SELECT id,title,content_type,status,summary,body,media_url,media_assets_json,anatomy_node_id,created_by,updated_by,created_at,updated_at,published_at FROM content_item WHERE 1=1");
        var args = new java.util.ArrayList<Object>();
        if (status != null && !status.isBlank()) { sql.append(" AND status = ?"); args.add(status); }
        if (contentType != null && !contentType.isBlank()) { sql.append(" AND content_type = ?"); args.add(contentType); }
        if (search != null && !search.isBlank()) { sql.append(" AND (LOWER(title) LIKE ? OR LOWER(summary) LIKE ?)"); String pattern = "%" + search.toLowerCase() + "%"; args.add(pattern); args.add(pattern); }
        sql.append(" ORDER BY updated_at DESC LIMIT ?"); args.add(limit);
        return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> map(rs), args.toArray());
    }

    public ContentItem findById(String id) {
        List<ContentItem> rows = jdbcTemplate.query("SELECT id,title,content_type,status,summary,body,media_url,media_assets_json,anatomy_node_id,created_by,updated_by,created_at,updated_at,published_at FROM content_item WHERE id = ?", (rs, rowNum) -> map(rs), id);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public void insert(ContentItem item) {
        jdbcTemplate.update("INSERT INTO content_item (id,title,content_type,status,summary,body,media_url,media_assets_json,anatomy_node_id,created_by,updated_by,created_at,updated_at,published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                item.id(), item.title(), item.contentType(), item.status(), item.summary(), item.body(), item.mediaUrl(), mediaJson(item.mediaAssets()), item.anatomyNodeId(), item.createdBy(), item.updatedBy(), Timestamp.from(item.createdAt()), Timestamp.from(item.updatedAt()), timestamp(item.publishedAt()));
    }

    public void update(ContentItem item) {
        jdbcTemplate.update("UPDATE content_item SET title=?,content_type=?,summary=?,body=?,media_url=?,media_assets_json=?,anatomy_node_id=?,updated_by=?,updated_at=? WHERE id=?",
                item.title(), item.contentType(), item.summary(), item.body(), item.mediaUrl(), mediaJson(item.mediaAssets()), item.anatomyNodeId(), item.updatedBy(), Timestamp.from(item.updatedAt()), item.id());
    }

    public void updateStatus(String id, String status, String updatedBy, Instant updatedAt, Instant publishedAt) {
        jdbcTemplate.update("UPDATE content_item SET status=?,updated_by=?,updated_at=?,published_at=? WHERE id=?",
                status, updatedBy, Timestamp.from(updatedAt), timestamp(publishedAt), id);
    }

    public boolean isMediaObjectReferenced(String objectName) {
        return jdbcTemplate.query("SELECT media_url, media_assets_json FROM content_item", (rs, rowNum) -> {
            if (objectName.equals(rs.getString("media_url"))) return true;
            return mediaAssets(rs.getString("media_assets_json")).stream()
                    .anyMatch(asset -> objectName.equals(asset.objectName()));
        }).stream().anyMatch(Boolean::booleanValue);
    }

    private ContentItem map(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new ContentItem(rs.getString("id"), rs.getString("title"), rs.getString("content_type"), rs.getString("status"),
                rs.getString("summary"), rs.getString("body"), rs.getString("media_url"), mediaAssets(rs.getString("media_assets_json")), rs.getString("anatomy_node_id"),
                rs.getString("created_by"), rs.getString("updated_by"), rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant(), rs.getTimestamp("published_at") == null ? null : rs.getTimestamp("published_at").toInstant());
    }

    private static Timestamp timestamp(Instant value) { return value == null ? null : Timestamp.from(value); }

    private String mediaJson(List<ContentMediaAsset> assets) {
        try { return objectMapper.writeValueAsString(assets == null ? List.of() : assets); }
        catch (Exception exception) { throw new IllegalArgumentException("invalid content media", exception); }
    }

    private List<ContentMediaAsset> mediaAssets(String json) {
        try { return json == null || json.isBlank() ? List.of() : objectMapper.readValue(json, MEDIA_LIST); }
        catch (Exception ignored) { return List.of(); }
    }

    public record ContentItem(String id, String title, String contentType, String status, String summary, String body,
                               String mediaUrl, List<ContentMediaAsset> mediaAssets, String anatomyNodeId, String createdBy, String updatedBy,
                               Instant createdAt, Instant updatedAt, Instant publishedAt) {}
    public record ContentMediaAsset(String url, String objectName, String fileName, long fileSize,
                                    String fileType, String fileETag) {}
}
