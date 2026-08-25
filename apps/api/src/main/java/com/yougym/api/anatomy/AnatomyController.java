package com.yougym.api.anatomy;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/anatomy")
public class AnatomyController {
    private final AnatomyNodeRepository repository;

    public AnatomyController(AnatomyNodeRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/tree")
    public Map<String, Object> tree(@RequestParam(defaultValue = "all") String gender,
                                    @RequestParam(defaultValue = "all") String view) {
        List<AnatomyNodeRepository.AnatomyNode> nodes = repository.findEnabled().stream()
                .filter(node -> matches(node.genderScope(), gender))
                .filter(node -> matchesView(node.view(), view))
                .toList();
        return Map.of("version", 1, "gender", gender, "view", view, "items", tree(nodes));
    }

    private static List<Map<String, Object>> tree(List<AnatomyNodeRepository.AnatomyNode> nodes) {
        Map<String, Map<String, Object>> byId = new LinkedHashMap<>();
        for (var node : nodes) {
            byId.put(node.id(), new LinkedHashMap<>(Map.of(
                    "id", node.id(), "parentId", node.parentId() == null ? "" : node.parentId(),
                    "code", node.code(), "nameZh", node.nameZh(), "nameEn", node.nameEn(),
                    "level", node.level(), "view", node.view(), "side", node.side(),
                    "assetPath", node.assetPath() == null ? "" : node.assetPath(),
                    "children", new ArrayList<Map<String, Object>>())));
        }
        List<Map<String, Object>> roots = new ArrayList<>();
        for (var node : nodes) {
            Map<String, Object> item = byId.get(node.id());
            if (node.parentId() == null || !byId.containsKey(node.parentId())) roots.add(item);
            else ((List<Map<String, Object>>) byId.get(node.parentId()).get("children")).add(item);
        }
        return roots;
    }

    private static boolean matches(String scope, String requested) {
        return requested == null || requested.equalsIgnoreCase("all") || scope.equalsIgnoreCase("ALL") || scope.equalsIgnoreCase(requested);
    }

    private static boolean matchesView(String nodeView, String requested) {
        return requested == null || requested.equalsIgnoreCase("all") || nodeView.equalsIgnoreCase("both") || nodeView.equalsIgnoreCase(requested);
    }
}
