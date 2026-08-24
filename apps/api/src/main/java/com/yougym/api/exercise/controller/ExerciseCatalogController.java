package com.yougym.api.exercise.controller;

import com.yougym.api.exercise.service.ExerciseCatalogService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/exercises")
public class ExerciseCatalogController {
    private final ExerciseCatalogService service;

    public ExerciseCatalogController(ExerciseCatalogService service) { this.service = service; }

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) String search,
                                    @RequestParam(required = false) String equipment,
                                    @RequestParam(defaultValue = "50") int limit) {
        return Map.of(
                "items", service.find(search, equipment, limit),
                "total", service.count(search, equipment),
                "source", "reference-images-v1");
    }

    @GetMapping("/{id}")
    public Map<String, Object> detail(@PathVariable String id) {
        var item = service.findById(id);
        if (item == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "exercise not found");
        return item;
    }
}
