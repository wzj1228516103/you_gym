package com.yougym.api.exercise.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class ExerciseCatalogMapper {
    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {};
    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    public ExerciseCatalogMapper(JdbcTemplate jdbc, ObjectMapper objectMapper) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
    }

    public List<Map<String, Object>> find(String search, String equipment, int limit) {
        StringBuilder sql = new StringBuilder("SELECT id,name_zh AS nameZh,name_en AS nameEn,target_muscles_json AS targetMusclesJson,equipment,location,difficulty_level AS difficultyLevel,recommended_reps AS recommendedReps,recommended_sets AS recommendedSets,rest_seconds_min AS restSecondsMin,rest_seconds_max AS restSecondsMax,angle_views_json AS angleViewsJson,step_labels_json AS stepLabelsJson,source_image AS sourceImage,source_panel AS sourcePanel,source_note AS sourceNote FROM exercise_catalog WHERE status='ACTIVE'");
        var args = new java.util.ArrayList<Object>();
        if (search != null && !search.isBlank()) { sql.append(" AND (LOWER(name_zh) LIKE ? OR LOWER(name_en) LIKE ?)"); String pattern = "%" + search.toLowerCase() + "%"; args.add(pattern); args.add(pattern); }
        if (equipment != null && !equipment.isBlank()) { sql.append(" AND equipment = ?"); args.add(equipment); }
        sql.append(" ORDER BY id LIMIT ?"); args.add(limit);
        return jdbc.queryForList(sql.toString(), args.toArray()).stream().map(this::withParsedFields).toList();
    }

    public Map<String, Object> findById(String id) {
        var rows = jdbc.queryForList("SELECT id,name_zh AS nameZh,name_en AS nameEn,target_muscles_json AS targetMusclesJson,equipment,location,difficulty_level AS difficultyLevel,recommended_reps AS recommendedReps,recommended_sets AS recommendedSets,rest_seconds_min AS restSecondsMin,rest_seconds_max AS restSecondsMax,angle_views_json AS angleViewsJson,step_labels_json AS stepLabelsJson,source_image AS sourceImage,source_panel AS sourcePanel,source_note AS sourceNote FROM exercise_catalog WHERE id=? AND status='ACTIVE'", id);
        return rows.isEmpty() ? null : withParsedFields(rows.get(0));
    }

    private Map<String, Object> withParsedFields(Map<String, Object> row) {
        var result = new java.util.LinkedHashMap<String, Object>();
        result.put("id", value(row, "id")); result.put("nameZh", value(row, "nameZh")); result.put("nameEn", value(row, "nameEn"));
        result.put("targetMuscles", parseList((String) value(row, "targetMusclesJson")));
        result.put("equipment", value(row, "equipment")); result.put("location", value(row, "location")); result.put("difficultyLevel", value(row, "difficultyLevel"));
        result.put("recommendedReps", value(row, "recommendedReps")); result.put("recommendedSets", value(row, "recommendedSets"));
        result.put("restSecondsMin", value(row, "restSecondsMin")); result.put("restSecondsMax", value(row, "restSecondsMax"));
        result.put("angleViews", parseList((String) value(row, "angleViewsJson")));
        result.put("stepLabels", parseList((String) value(row, "stepLabelsJson")));
        result.put("sourceImage", value(row, "sourceImage")); result.put("sourcePanel", value(row, "sourcePanel")); result.put("sourceNote", value(row, "sourceNote"));
        var resources = jdbc.queryForList("SELECT id,resource_type AS resourceType,view_label AS viewLabel,resource_url AS resourceUrl,sort_order AS sortOrder,source_image AS sourceImage FROM exercise_resource WHERE exercise_id=? ORDER BY sort_order,id", value(row, "id"));
        result.put("resources", resources.stream().map(resource -> Map.<String, Object>of(
                "id", value(resource, "id"), "resourceType", value(resource, "resourceType"),
                "viewLabel", value(resource, "viewLabel"), "resourceUrl", value(resource, "resourceUrl"),
                "sortOrder", value(resource, "sortOrder"), "sourceImage", value(resource, "sourceImage"))).toList());
        return result;
    }

    private static Object value(Map<String, Object> row, String name) {
        for (var entry : row.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(name)) return entry.getValue();
        }
        return null;
    }

    private List<String> parseList(String value) {
        try { return value == null || value.isBlank() ? List.of() : objectMapper.readValue(value, STRING_LIST); }
        catch (Exception ignored) { return List.of(); }
    }
}
