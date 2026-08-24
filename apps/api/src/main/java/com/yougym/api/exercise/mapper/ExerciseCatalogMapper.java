package com.yougym.api.exercise.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
public class ExerciseCatalogMapper {
    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {};
    private static final TypeReference<Map<String, String>> STRING_MAP = new TypeReference<>() {};
    private static final TypeReference<Map<String, List<String>>> STRING_LIST_MAP = new TypeReference<>() {};
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
        sql.append(" ORDER BY CASE WHEN source_panel='Exercises Dataset' THEN 1 ELSE 0 END, id LIMIT ?"); args.add(limit);
        var rows = jdbc.queryForList(sql.toString(), args.toArray());
        var resources = findResources(rows.stream().map(row -> value(row, "id")).toList());
        return rows.stream().map(row -> withParsedFields(row, false, resources.getOrDefault(String.valueOf(value(row, "id")), List.of()))).toList();
    }

    public int count(String search, String equipment) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM exercise_catalog WHERE status='ACTIVE'");
        var args = new ArrayList<Object>();
        if (search != null && !search.isBlank()) {
            sql.append(" AND (LOWER(name_zh) LIKE ? OR LOWER(name_en) LIKE ?)");
            String pattern = "%" + search.toLowerCase() + "%";
            args.add(pattern);
            args.add(pattern);
        }
        if (equipment != null && !equipment.isBlank()) {
            sql.append(" AND equipment = ?");
            args.add(equipment);
        }
        Integer count = jdbc.queryForObject(sql.toString(), Integer.class, args.toArray());
        return count == null ? 0 : count;
    }

    public Map<String, Object> findById(String id) {
        var rows = jdbc.queryForList("SELECT id,name_zh AS nameZh,name_en AS nameEn,target_muscles_json AS targetMusclesJson,equipment,location,difficulty_level AS difficultyLevel,recommended_reps AS recommendedReps,recommended_sets AS recommendedSets,rest_seconds_min AS restSecondsMin,rest_seconds_max AS restSecondsMax,angle_views_json AS angleViewsJson,step_labels_json AS stepLabelsJson,source_image AS sourceImage,source_panel AS sourcePanel,source_note AS sourceNote FROM exercise_catalog WHERE id=? AND status='ACTIVE'", id);
        if (rows.isEmpty()) return null;
        var resources = findResources(List.of(id)).getOrDefault(id, List.of());
        return withParsedFields(rows.get(0), true, resources);
    }

    private Map<String, Object> withParsedFields(Map<String, Object> row, boolean includeDatasetDetail, List<Map<String, Object>> resources) {
        var result = new LinkedHashMap<String, Object>();
        result.put("id", value(row, "id")); result.put("nameZh", value(row, "nameZh")); result.put("nameEn", value(row, "nameEn"));
        result.put("targetMuscles", parseList((String) value(row, "targetMusclesJson")));
        result.put("equipment", value(row, "equipment")); result.put("location", value(row, "location")); result.put("difficultyLevel", value(row, "difficultyLevel"));
        result.put("recommendedReps", value(row, "recommendedReps")); result.put("recommendedSets", value(row, "recommendedSets"));
        result.put("restSecondsMin", value(row, "restSecondsMin")); result.put("restSecondsMax", value(row, "restSecondsMax"));
        result.put("angleViews", parseList((String) value(row, "angleViewsJson")));
        result.put("stepLabels", parseList((String) value(row, "stepLabelsJson")));
        result.put("sourceImage", value(row, "sourceImage")); result.put("sourcePanel", value(row, "sourcePanel")); result.put("sourceNote", value(row, "sourceNote"));
        result.put("resources", resources);
        if (includeDatasetDetail) addDatasetDetail(result, value(row, "id"));
        return result;
    }

    private Map<String, List<Map<String, Object>>> findResources(List<?> exerciseIds) {
        if (exerciseIds.isEmpty()) return Map.of();
        String placeholders = String.join(",", Collections.nCopies(exerciseIds.size(), "?"));
        var rows = jdbc.queryForList("SELECT exercise_id AS exerciseId,id,resource_type AS resourceType,view_label AS viewLabel,resource_url AS resourceUrl,sort_order AS sortOrder,source_image AS sourceImage FROM exercise_resource WHERE exercise_id IN (" + placeholders + ") ORDER BY exercise_id,sort_order,id", exerciseIds.toArray());
        var grouped = new LinkedHashMap<String, List<Map<String, Object>>>();
        for (var row : rows) {
            String exerciseId = String.valueOf(value(row, "exerciseId"));
            grouped.computeIfAbsent(exerciseId, ignored -> new ArrayList<>()).add(resource(row));
        }
        return grouped;
    }

    private Map<String, Object> resource(Map<String, Object> row) {
        var result = new LinkedHashMap<String, Object>();
        result.put("id", value(row, "id"));
        result.put("resourceType", value(row, "resourceType"));
        result.put("viewLabel", value(row, "viewLabel"));
        result.put("resourceUrl", value(row, "resourceUrl"));
        result.put("sortOrder", value(row, "sortOrder"));
        result.put("sourceImage", value(row, "sourceImage"));
        return result;
    }

    private void addDatasetDetail(Map<String, Object> result, Object exerciseId) {
        var rows = jdbc.queryForList("SELECT dataset_id AS datasetId,category,body_part AS bodyPart,muscle_group AS muscleGroup,secondary_muscles_json AS secondaryMusclesJson,instructions_json AS instructionsJson,instruction_steps_json AS instructionStepsJson,media_id AS mediaId,media_attribution AS mediaAttribution,dataset_created_at AS datasetCreatedAt,source_url AS sourceUrl FROM exercise_dataset_detail WHERE exercise_id=?", exerciseId);
        if (rows.isEmpty()) return;

        var row = rows.get(0);
        var detail = new LinkedHashMap<String, Object>();
        detail.put("datasetId", value(row, "datasetId"));
        detail.put("category", value(row, "category"));
        detail.put("bodyPart", value(row, "bodyPart"));
        detail.put("muscleGroup", value(row, "muscleGroup"));
        detail.put("secondaryMuscles", parseList((String) value(row, "secondaryMusclesJson")));
        detail.put("instructions", parseStringMap((String) value(row, "instructionsJson")));
        detail.put("instructionSteps", parseStringListMap((String) value(row, "instructionStepsJson")));
        detail.put("mediaId", value(row, "mediaId"));
        detail.put("mediaAttribution", value(row, "mediaAttribution"));
        detail.put("datasetCreatedAt", value(row, "datasetCreatedAt"));
        detail.put("sourceUrl", value(row, "sourceUrl"));
        result.put("datasetDetail", detail);
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

    private Map<String, String> parseStringMap(String value) {
        try { return value == null || value.isBlank() ? Map.of() : objectMapper.readValue(value, STRING_MAP); }
        catch (Exception ignored) { return Map.of(); }
    }

    private Map<String, List<String>> parseStringListMap(String value) {
        try { return value == null || value.isBlank() ? Map.of() : objectMapper.readValue(value, STRING_LIST_MAP); }
        catch (Exception ignored) { return Map.of(); }
    }
}
