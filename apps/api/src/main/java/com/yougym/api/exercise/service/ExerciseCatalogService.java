package com.yougym.api.exercise.service;

import com.yougym.api.exercise.mapper.ExerciseCatalogMapper;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
public class ExerciseCatalogService {
    private final ExerciseCatalogMapper mapper;
    private final ExerciseMediaUrlResolver mediaUrlResolver;

    public ExerciseCatalogService(ExerciseCatalogMapper mapper, ExerciseMediaUrlResolver mediaUrlResolver) {
        this.mapper = mapper;
        this.mediaUrlResolver = mediaUrlResolver;
    }

    public List<Map<String, Object>> find(String search, String equipment, int limit) {
        return find(search, equipment, limit, 0);
    }

    public List<Map<String, Object>> find(String search, String equipment, int limit, int offset) {
        int safeLimit = Math.max(1, Math.min(limit, 2000));
        int safeOffset = Math.max(0, offset);
        return mediaUrlResolver.resolveMany(mapper.find(search, equipment, safeLimit, safeOffset));
    }
    public int count(String search, String equipment) { return mapper.count(search, equipment); }
    public Map<String, Object> findById(String id) {
        Map<String, Object> item = mapper.findById(id);
        return item == null ? null : mediaUrlResolver.resolveOne(item);
    }

    public Map<String, Object> update(String id, String nameZh, String nameEn, List<String> targetMuscles, String equipment,
                                      String location, String difficultyLevel, String recommendedReps, String recommendedSets,
                                      Integer restSecondsMin, Integer restSecondsMax, String sourceNote) {
        if (id == null || id.isBlank() || !mapper.exists(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "exercise not found");
        }
        mapper.update(id, nameZh, nameEn, targetMuscles, equipment, location, difficultyLevel, recommendedReps, recommendedSets,
                restSecondsMin, restSecondsMax, sourceNote);
        return mediaUrlResolver.resolveOne(mapper.findById(id));
    }
}
