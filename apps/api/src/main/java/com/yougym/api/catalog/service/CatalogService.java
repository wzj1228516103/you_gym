package com.yougym.api.catalog.service;

import com.yougym.api.catalog.mapper.CatalogMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CatalogService {
    private final CatalogMapper mapper;
    private final FoodMediaUrlResolver mediaUrlResolver;

    public CatalogService(CatalogMapper mapper, FoodMediaUrlResolver mediaUrlResolver) {
        this.mapper = mapper;
        this.mediaUrlResolver = mediaUrlResolver;
    }

    public List<Map<String, Object>> plans(String category, String search, int limit) { return mapper.plans(category, search, clamp(limit)); }
    public Map<String, Object> plan(String id) { return mapper.plan(id); }
    public List<Map<String, Object>> foods(String search, int limit) { return mediaUrlResolver.resolveMany(mapper.foods(search, clamp(limit))); }
    public Map<String, Object> food(String id) {
        Map<String, Object> item = mapper.food(id);
        return item == null ? null : mediaUrlResolver.resolveOne(item);
    }
    private static int clamp(int limit) { return Math.max(1, Math.min(limit, 100)); }
}
