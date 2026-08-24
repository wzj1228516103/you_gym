package com.yougym.api.exercise;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Component
public class ExerciseDatasetImportRunner implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(ExerciseDatasetImportRunner.class);
    private static final String DATASET_KEY = "hasaneyldrm-exercises-dataset-v1";
    private static final String DATASET_SOURCE = "https://github.com/hasaneyldrm/exercises-dataset";
    private static final String RAW_BASE = "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/";
    private static final String ATTRIBUTION = "© Gym visual — https://gymvisual.com/";

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;
    private final TransactionTemplate transactionTemplate;

    public ExerciseDatasetImportRunner(JdbcTemplate jdbc, ObjectMapper objectMapper, TransactionTemplate transactionTemplate) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
        this.transactionTemplate = transactionTemplate;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        List<DatasetExercise> dataset = loadDataset();
        if (isImported()) {
            transactionTemplate.executeWithoutResult(status -> ensureDatasetResources(dataset));
            log.info("Exercises Dataset is already imported");
            return;
        }

        transactionTemplate.executeWithoutResult(status -> importDataset(dataset));
        log.info("Imported {} Exercises Dataset records", dataset.size());
    }

    private List<DatasetExercise> loadDataset() throws Exception {
        try (InputStream input = new ClassPathResource("data/exercises-dataset.json").getInputStream()) {
            return objectMapper.readValue(input, new TypeReference<>() {});
        }
    }

    private boolean isImported() {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM exercise_dataset_import WHERE dataset_key = ?",
                Integer.class,
                DATASET_KEY);
        return count != null && count > 0;
    }

    private void importDataset(List<DatasetExercise> dataset) {
        for (DatasetExercise item : dataset) {
            String exerciseId = "ds-" + item.id();
            String imageUrl = rawAssetUrl(item.image());
            String gifUrl = rawAssetUrl(item.gifUrl());
            String stepsJson = writeJson(item.instructionSteps() == null ? Map.of() : item.instructionSteps().getOrDefault("en", List.of()));
            if (stepsJson.length() > 950) stepsJson = "[]";

            jdbc.update("""
                    INSERT INTO exercise_catalog
                        (id, name_zh, name_en, target_muscles_json, equipment, location, difficulty_level,
                         recommended_reps, recommended_sets, rest_seconds_min, rest_seconds_max,
                         angle_views_json, step_labels_json, source_image, source_panel, source_note, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'UNSPECIFIED', '8-12', '3', 60, 90, '[]', ?, ?, 'Exercises Dataset', ?, 'ACTIVE')
                    """,
                    exerciseId,
                    item.name(),
                    item.name(),
                    writeJson(toMuscleCodes(item)),
                    toEquipment(item.equipment()),
                    toLocation(item.equipment()),
                    stepsJson,
                    imageUrl,
                    "Imported from Exercises Dataset; " + ATTRIBUTION);

            jdbc.update("""
                    INSERT INTO exercise_dataset_detail
                        (exercise_id, dataset_id, category, body_part, muscle_group, secondary_muscles_json,
                         instructions_json, instruction_steps_json, media_id, media_attribution,
                         dataset_created_at, source_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    exerciseId,
                    item.id(),
                    item.category(),
                    item.bodyPart(),
                    item.muscleGroup(),
                    writeJson(item.secondaryMuscles() == null ? List.of() : item.secondaryMuscles()),
                    writeJson(item.instructions() == null ? Map.of() : item.instructions()),
                    writeJson(item.instructionSteps() == null ? Map.of() : item.instructionSteps()),
                    item.mediaId(),
                    item.attribution() == null || item.attribution().isBlank() ? ATTRIBUTION : item.attribution(),
                    item.createdAt(),
                    DATASET_SOURCE);

            insertResource(exerciseId, "THUMBNAIL_IMAGE", "Dataset thumbnail", imageUrl, 10);
            insertResource(exerciseId, "ANIMATION_GIF", "Dataset animation", gifUrl, 20);
        }

        jdbc.update("INSERT INTO exercise_dataset_import (dataset_key, source_url, record_count) VALUES (?, ?, ?)",
                DATASET_KEY, DATASET_SOURCE, dataset.size());
    }

    private void ensureDatasetResources(List<DatasetExercise> dataset) {
        Set<String> exerciseIds = new HashSet<>(jdbc.queryForList(
                "SELECT id FROM exercise_catalog WHERE id LIKE 'ds-%'", String.class));
        Set<String> resourceIds = new HashSet<>(jdbc.queryForList(
                "SELECT id FROM exercise_resource WHERE id LIKE 'res-ds-%'", String.class));
        int repaired = 0;
        for (DatasetExercise item : dataset) {
            String exerciseId = "ds-" + item.id();
            if (!exerciseIds.contains(exerciseId)) continue;
            repaired += ensureResource(exerciseId, "THUMBNAIL_IMAGE", "Dataset thumbnail", rawAssetUrl(item.image()), 10, resourceIds);
            repaired += ensureResource(exerciseId, "ANIMATION_GIF", "Dataset animation", rawAssetUrl(item.gifUrl()), 20, resourceIds);
        }
        if (repaired > 0) log.info("Repaired {} Exercises Dataset media resources", repaired);
    }

    private int ensureResource(String exerciseId, String resourceType, String viewLabel, String url, int sortOrder, Set<String> resourceIds) {
        if (url == null || url.isBlank()) return 0;
        String resourceId = "res-" + exerciseId + "-" + resourceType.toLowerCase(Locale.ROOT);
        if (resourceIds.contains(resourceId)) return 0;
        insertResource(exerciseId, resourceType, viewLabel, url, sortOrder);
        resourceIds.add(resourceId);
        return 1;
    }

    private void insertResource(String exerciseId, String resourceType, String viewLabel, String url, int sortOrder) {
        if (url == null || url.isBlank()) return;
        jdbc.update("""
                INSERT INTO exercise_resource
                    (id, exercise_id, resource_type, view_label, resource_url, sort_order, source_image)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                "res-" + exerciseId + "-" + resourceType.toLowerCase(Locale.ROOT),
                exerciseId,
                resourceType,
                viewLabel,
                url,
                sortOrder,
                url);
    }

    private String rawAssetUrl(String path) {
        if (path == null || path.isBlank()) return null;
        String normalized = path.replace('\\', '/');
        while (normalized.startsWith("./")) normalized = normalized.substring(2);
        while (normalized.startsWith("/")) normalized = normalized.substring(1);
        return RAW_BASE + normalized;
    }

    private List<String> toMuscleCodes(DatasetExercise item) {
        Set<String> codes = new LinkedHashSet<>();
        addMuscleCode(codes, item.target());
        addMuscleCode(codes, item.muscleGroup());
        if (item.secondaryMuscles() != null) item.secondaryMuscles().forEach(value -> addMuscleCode(codes, value));
        return new ArrayList<>(codes);
    }

    private void addMuscleCode(Set<String> codes, String value) {
        if (value == null || value.isBlank()) return;
        String normalized = value.trim().toLowerCase(Locale.ROOT).replace('_', ' ');
        String code = switch (normalized) {
            case "abs", "abdominals", "abdominal" -> "muscle.rectus-abdominis";
            case "biceps", "biceps brachii" -> "muscle.biceps-brachii";
            case "triceps", "triceps brachii" -> "muscle.triceps-brachii";
            case "lats", "latissimus dorsi" -> "muscle.latissimus-dorsi";
            case "pectorals", "pectoralis major", "chest" -> "muscle.pectoralis-major";
            case "delts", "deltoids", "shoulders", "deltoid" -> "muscle.deltoid";
            case "front delts", "anterior deltoid" -> "muscle.deltoid.anterior";
            case "side delts", "lateral deltoid", "middle deltoid" -> "muscle.deltoid.middle";
            case "rear delts", "posterior deltoid" -> "muscle.deltoid.posterior";
            case "traps", "trapezius" -> "muscle.trapezius";
            case "lower back", "erector spinae" -> "muscle.erector-spinae";
            case "glutes", "gluteus maximus" -> "muscle.gluteus-maximus";
            case "gluteus medius" -> "muscle.gluteus-medius";
            case "quads", "quadriceps" -> "muscle.quadriceps";
            case "hamstrings" -> "muscle.hamstrings";
            case "adductors" -> "muscle.adductors";
            case "calves", "gastrocnemius" -> "muscle.gastrocnemius";
            case "tibialis anterior", "shins" -> "muscle.tibialis-anterior";
            case "core", "waist" -> "muscle.core";
            default -> "dataset." + normalized.replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        };
        if (!code.isBlank()) codes.add(code);
    }

    private String toEquipment(String equipment) {
        if (equipment == null || equipment.isBlank()) return "其他";
        return switch (equipment.trim().toLowerCase(Locale.ROOT)) {
            case "body weight" -> "自重";
            case "dumbbell" -> "哑铃";
            case "barbell", "ez barbell" -> "杠铃";
            case "cable", "leverage machine", "smith machine", "weighted", "stability ball" -> "器械";
            case "band" -> "弹力带";
            case "kettlebell" -> "壶铃";
            default -> equipment;
        };
    }

    private String toLocation(String equipment) {
        return equipment != null && equipment.trim().equalsIgnoreCase("body weight") ? "家庭" : "健身房";
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to serialize Exercises Dataset field", exception);
        }
    }

    private record DatasetExercise(
            String id,
            String name,
            String category,
            @JsonProperty("body_part") String bodyPart,
            String equipment,
            Map<String, String> instructions,
            @JsonProperty("instruction_steps") Map<String, List<String>> instructionSteps,
            @JsonProperty("muscle_group") String muscleGroup,
            @JsonProperty("secondary_muscles") List<String> secondaryMuscles,
            String target,
            String image,
            @JsonProperty("gif_url") String gifUrl,
            @JsonProperty("media_id") String mediaId,
            @JsonProperty("created_at") String createdAt,
            String attribution) {
    }
}
