package com.yougym.api.catalog.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
public class CatalogMapper {
    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    public CatalogMapper(JdbcTemplate jdbc, ObjectMapper objectMapper) { this.jdbc = jdbc; this.objectMapper = objectMapper; }

    public List<Map<String, Object>> plans(String category, String search, int limit) {
        StringBuilder sql = new StringBuilder("SELECT p.id,p.title,p.description,p.duration_label AS durationLabel,p.level,p.target,p.category,COUNT(i.id) AS exerciseCount FROM training_plan p LEFT JOIN training_plan_item i ON i.plan_id=p.id WHERE p.status='ACTIVE'");
        List<Object> args = new ArrayList<>();
        if (category != null && !category.isBlank() && !category.equals("全部")) { sql.append(" AND p.category=?"); args.add(category); }
        if (search != null && !search.isBlank()) { sql.append(" AND (LOWER(p.title) LIKE ? OR LOWER(p.description) LIKE ?)"); String term = "%" + search.trim().toLowerCase() + "%"; args.add(term); args.add(term); }
        sql.append(" GROUP BY p.id,p.title,p.description,p.duration_label,p.level,p.target,p.category ORDER BY p.updated_at DESC,p.id LIMIT ?");
        args.add(limit);
        return jdbc.queryForList(sql.toString(), args.toArray()).stream().map(this::planSummary).toList();
    }

    public Map<String, Object> plan(String id) {
        var rows = jdbc.queryForList("SELECT p.id,p.title,p.description,p.duration_label AS durationLabel,p.level,p.target,p.category,COUNT(i.id) AS exerciseCount FROM training_plan p LEFT JOIN training_plan_item i ON i.plan_id=p.id WHERE p.id=? AND p.status='ACTIVE' GROUP BY p.id,p.title,p.description,p.duration_label,p.level,p.target,p.category", id);
        if (rows.isEmpty()) return null;
        Map<String, Object> result = planSummary(rows.get(0));
        result.put("exercises", jdbc.queryForList("SELECT e.id,e.name_zh AS nameZh,e.name_en AS nameEn,e.equipment,e.location,i.sets,i.reps,i.rest_seconds AS restSeconds,i.sort_order AS sortOrder FROM training_plan_item i JOIN exercise_catalog e ON e.id=i.exercise_id WHERE i.plan_id=? AND e.status='ACTIVE' ORDER BY i.sort_order", id).stream().map(this::planExercise).toList());
        return result;
    }

    public List<Map<String, Object>> foods(String search, int limit) {
        if (search == null || search.isBlank()) return jdbc.queryForList("SELECT id,name_zh AS name,serving_label AS serving,calories_per_100g AS calories,protein_per_100g AS protein,carbs_per_100g AS carbs,fat_per_100g AS fat,source,media_url AS mediaUrl,media_assets_json AS mediaAssetsJson FROM food_catalog WHERE status='ACTIVE' ORDER BY name_zh LIMIT ?", limit).stream().map(this::food).toList();
        return jdbc.queryForList("SELECT id,name_zh AS name,serving_label AS serving,calories_per_100g AS calories,protein_per_100g AS protein,carbs_per_100g AS carbs,fat_per_100g AS fat,source,media_url AS mediaUrl,media_assets_json AS mediaAssetsJson FROM food_catalog WHERE status='ACTIVE' AND LOWER(name_zh) LIKE ? ORDER BY name_zh LIMIT ?", "%" + search.trim().toLowerCase() + "%", limit).stream().map(this::food).toList();
    }

    public Map<String, Object> food(String id) {
        var rows = jdbc.queryForList("SELECT id,name_zh AS name,serving_label AS serving,calories_per_100g AS calories,protein_per_100g AS protein,carbs_per_100g AS carbs,fat_per_100g AS fat,source,media_url AS mediaUrl,media_assets_json AS mediaAssetsJson FROM food_catalog WHERE id=? AND status='ACTIVE'", id);
        return rows.isEmpty() ? null : food(rows.get(0));
    }

    private Map<String, Object> planSummary(Map<String, Object> row) {
        Map<String, Object> result = new LinkedHashMap<>();
        copy(result, row, "id", "title", "description", "durationLabel", "level", "target", "category", "exerciseCount");
        return result;
    }

    private Map<String, Object> planExercise(Map<String, Object> row) {
        Map<String, Object> result = new LinkedHashMap<>();
        copy(result, row, "id", "nameZh", "nameEn", "equipment", "location", "sets", "reps", "restSeconds", "sortOrder");
        return result;
    }

    private Map<String, Object> food(Map<String, Object> row) {
        Map<String, Object> result = new LinkedHashMap<>();
        copy(result, row, "id", "name", "serving", "calories", "protein", "carbs", "fat", "source", "mediaUrl");
        result.put("mediaAssets", parseMedia((String) value(row, "mediaAssetsJson")));
        return result;
    }

    private static void copy(Map<String, Object> target, Map<String, Object> source, String... names) {
        for (String name : names) target.put(name, value(source, name));
    }

    private static Object value(Map<String, Object> row, String name) {
        for (var entry : row.entrySet()) if (entry.getKey().equalsIgnoreCase(name)) return entry.getValue();
        return null;
    }

    private List<Map<String, Object>> parseMedia(String json) {
        try { return json == null || json.isBlank() ? List.of() : objectMapper.readValue(json, new TypeReference<>() {}); }
        catch (Exception ignored) { return List.of(); }
    }
}
