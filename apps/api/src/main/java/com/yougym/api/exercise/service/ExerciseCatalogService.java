package com.yougym.api.exercise.service;

import com.yougym.api.exercise.mapper.ExerciseCatalogMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ExerciseCatalogService {
    private final ExerciseCatalogMapper mapper;

    public ExerciseCatalogService(ExerciseCatalogMapper mapper) { this.mapper = mapper; }

    public List<Map<String, Object>> find(String search, String equipment, int limit) { return mapper.find(search, equipment, Math.max(1, Math.min(limit, 2000))); }
    public int count(String search, String equipment) { return mapper.count(search, equipment); }
    public Map<String, Object> findById(String id) { return mapper.findById(id); }
}
