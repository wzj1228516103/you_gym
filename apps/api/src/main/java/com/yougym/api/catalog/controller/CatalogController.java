package com.yougym.api.catalog.controller;

import com.yougym.api.catalog.service.CatalogService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class CatalogController {
    private final CatalogService service;

    public CatalogController(CatalogService service) { this.service = service; }

    @GetMapping("/plans")
    public Map<String, Object> plans(@RequestParam(required = false) String category,
                                     @RequestParam(required = false) String search,
                                     @RequestParam(defaultValue = "50") int limit) {
        return Map.of("items", service.plans(category, search, limit));
    }

    @GetMapping("/plans/{id}")
    public Map<String, Object> plan(@PathVariable String id) {
        var result = service.plan(id);
        if (result == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "plan not found");
        return result;
    }

    @GetMapping("/foods")
    public Map<String, Object> foods(@RequestParam(required = false) String search,
                                     @RequestParam(defaultValue = "50") int limit) {
        return Map.of("items", service.foods(search, limit));
    }

    @GetMapping("/foods/{id}")
    public Map<String, Object> food(@PathVariable String id) {
        var result = service.food(id);
        if (result == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "food not found");
        return result;
    }
}
