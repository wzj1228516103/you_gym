package com.yougym.api.catalog.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
public class FoodCatalogMapper {
    private static final TypeReference<List<Map<String, Object>>> MEDIA_LIST = new TypeReference<>() {};
    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    public FoodCatalogMapper(JdbcTemplate jdbc, ObjectMapper objectMapper) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
    }

    public List<Map<String, Object>> find(String search, String status, int limit) {
        return find(search, status, limit, 0);
    }

    public List<Map<String, Object>> find(String search, String status, int limit, int offset) {
        StringBuilder sql = new StringBuilder("SELECT id,name_zh AS name,serving_label AS serving,calories_per_100g AS calories,protein_per_100g AS protein,carbs_per_100g AS carbs,fat_per_100g AS fat,source,status,media_url AS mediaUrl,media_assets_json AS mediaAssetsJson,created_at AS createdAt,updated_at AS updatedAt FROM food_catalog WHERE 1=1");
        List<Object> args = new ArrayList<>();
        if (status != null && !status.isBlank()) {
            sql.append(" AND status=?");
            args.add(status);
        }
        if (search != null && !search.isBlank()) {
            sql.append(" AND (LOWER(name_zh) LIKE ? OR LOWER(source) LIKE ?)");
            String pattern = "%" + search.trim().toLowerCase() + "%";
            args.add(pattern);
            args.add(pattern);
        }
        sql.append(" ORDER BY updated_at DESC,name_zh LIMIT ? OFFSET ?");
        args.add(limit);
        args.add(offset);
        return jdbc.queryForList(sql.toString(), args.toArray()).stream().map(this::copy).toList();
    }

    public int count(String search, String status) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM food_catalog WHERE 1=1");
        List<Object> args = new ArrayList<>();
        if (status != null && !status.isBlank()) { sql.append(" AND status=?"); args.add(status); }
        if (search != null && !search.isBlank()) {
            sql.append(" AND (LOWER(name_zh) LIKE ? OR LOWER(source) LIKE ?)");
            String pattern = "%" + search.trim().toLowerCase() + "%";
            args.add(pattern);
            args.add(pattern);
        }
        Integer count = jdbc.queryForObject(sql.toString(), Integer.class, args.toArray());
        return count == null ? 0 : count;
    }

    public Map<String, Object> findById(String id) {
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT id,name_zh AS name,serving_label AS serving,calories_per_100g AS calories,protein_per_100g AS protein,carbs_per_100g AS carbs,fat_per_100g AS fat,source,status,media_url AS mediaUrl,media_assets_json AS mediaAssetsJson,created_at AS createdAt,updated_at AS updatedAt FROM food_catalog WHERE id=?", id);
        return rows.isEmpty() ? null : copy(rows.get(0));
    }

    public boolean exists(String id) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM food_catalog WHERE id=?", Integer.class, id);
        return count != null && count > 0;
    }

    public void insert(String id, String name, String serving, BigDecimal calories, BigDecimal protein,
                       BigDecimal carbs, BigDecimal fat, String source, String status, String mediaUrl,
                       List<?> mediaAssets, Instant now) {
        jdbc.update("INSERT INTO food_catalog (id,name_zh,serving_label,calories_per_100g,protein_per_100g,carbs_per_100g,fat_per_100g,source,status,media_url,media_assets_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
                id, name, serving, calories, protein, carbs, fat, source, status, mediaUrl, mediaJson(mediaAssets), Timestamp.from(now), Timestamp.from(now));
    }

    public void update(String id, String name, String serving, BigDecimal calories, BigDecimal protein,
                       BigDecimal carbs, BigDecimal fat, String source, String mediaUrl, List<?> mediaAssets, Instant now) {
        jdbc.update("UPDATE food_catalog SET name_zh=?,serving_label=?,calories_per_100g=?,protein_per_100g=?,carbs_per_100g=?,fat_per_100g=?,source=?,media_url=?,media_assets_json=?,updated_at=? WHERE id=?",
                name, serving, calories, protein, carbs, fat, source, mediaUrl, mediaJson(mediaAssets), Timestamp.from(now), id);
    }

    public void updateStatus(String id, String status, Instant now) {
        jdbc.update("UPDATE food_catalog SET status=?,updated_at=? WHERE id=?", status, Timestamp.from(now), id);
    }

    public boolean delete(String id) {
        return jdbc.update("DELETE FROM food_catalog WHERE id=?", id) > 0;
    }

    public boolean isMediaObjectReferenced(String objectName) {
        if (objectName == null || objectName.isBlank()) return false;
        return jdbc.query("SELECT media_url, media_assets_json FROM food_catalog", (rs, rowNum) -> {
            if (objectName.equals(rs.getString("media_url"))) return true;
            return parseMedia(rs.getString("media_assets_json")).stream()
                    .anyMatch(asset -> objectName.equals(String.valueOf(asset.get("objectName"))));
        }).stream().anyMatch(Boolean::booleanValue);
    }

    private Map<String, Object> copy(Map<String, Object> row) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", value(row, "id"));
        result.put("name", value(row, "name"));
        result.put("serving", value(row, "serving"));
        result.put("calories", value(row, "calories"));
        result.put("protein", value(row, "protein"));
        result.put("carbs", value(row, "carbs"));
        result.put("fat", value(row, "fat"));
        result.put("source", value(row, "source"));
        result.put("status", value(row, "status"));
        result.put("mediaUrl", value(row, "mediaUrl"));
        result.put("mediaAssets", parseMedia((String) value(row, "mediaAssetsJson")));
        result.put("createdAt", value(row, "createdAt"));
        result.put("updatedAt", value(row, "updatedAt"));
        return result;
    }

    private static Object value(Map<String, Object> row, String name) {
        for (var entry : row.entrySet()) if (entry.getKey().equalsIgnoreCase(name)) return entry.getValue();
        return null;
    }

    private String mediaJson(List<?> mediaAssets) {
        try { return objectMapper.writeValueAsString(mediaAssets == null ? List.of() : mediaAssets); }
        catch (Exception exception) { throw new IllegalArgumentException("invalid food media", exception); }
    }

    private List<Map<String, Object>> parseMedia(String json) {
        try { return json == null || json.isBlank() ? List.of() : objectMapper.readValue(json, MEDIA_LIST); }
        catch (Exception ignored) { return List.of(); }
    }
}
