package com.yougym.api.catalog.service;

import com.yougym.api.catalog.mapper.CatalogMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CatalogService {
    private final CatalogMapper mapper;

    public CatalogService(CatalogMapper mapper) { this.mapper = mapper; }

    public List<Map<String, Object>> plans(String category, String search, int limit) { return mapper.plans(category, search, clamp(limit)); }
    public Map<String, Object> plan(String id) { return mapper.plan(id); }
    public List<Map<String, Object>> foods(String search, int limit) { return mapper.foods(search, clamp(limit)); }
    public Map<String, Object> food(String id) { return mapper.food(id); }
    private static int clamp(int limit) { return Math.max(1, Math.min(limit, 100)); }
}
