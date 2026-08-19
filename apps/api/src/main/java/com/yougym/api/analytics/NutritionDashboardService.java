package com.yougym.api.analytics;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

@Service
public class NutritionDashboardService {
    private static final TypeReference<Map<String, Object>> PROPERTIES = new TypeReference<>() {};
    private final AnalyticsEventRepository repository;
    private final ObjectMapper objectMapper;

    public NutritionDashboardService(AnalyticsEventRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public Dashboard dashboard(Instant from, Instant to, ZoneId zoneId) {
        var events = repository.findNutrition(from, to, 10000);
        Set<String> users = new LinkedHashSet<>();
        Map<String, Count> eventCounts = new LinkedHashMap<>();
        Map<String, Count> mealCounts = new LinkedHashMap<>();
        Map<String, DailyCount> daily = new TreeMap<>();
        for (var event : events) {
            add(users, event.analyticsUserId());
            eventCounts.computeIfAbsent(event.eventName(), ignored -> new Count()).add(event.analyticsUserId());
            String date = LocalDate.ofInstant(event.occurredAt(), zoneId).toString();
            daily.computeIfAbsent(date, ignored -> new DailyCount()).add(event.analyticsUserId());
            String meal = property(event.propertiesJson(), "mealName");
            if (meal != null) mealCounts.computeIfAbsent(meal, ignored -> new Count()).add(event.analyticsUserId());
        }
        return new Dashboard(from, to, zoneId.getId(), new Kpis(events.size(), users.size(), count(eventCounts, "nutrition_screen_viewed"),
                count(eventCounts, "nutrition_food_search_opened"), count(eventCounts, "nutrition_item_selected"), count(eventCounts, "nutrition_meal_recorded")),
                ranked(eventCounts), ranked(mealCounts), daily.entrySet().stream().map(entry -> new TrendPoint(entry.getKey(), entry.getValue().events, entry.getValue().users.size())).toList(),
                events.stream().limit(30).toList());
    }

    private static long count(Map<String, Count> counts, String key) { return counts.getOrDefault(key, new Count()).events; }
    private List<Breakdown> ranked(Map<String, Count> counts) {
        return counts.entrySet().stream().map(entry -> new Breakdown(entry.getKey(), entry.getValue().events, entry.getValue().users.size()))
                .sorted(Comparator.comparingLong(Breakdown::eventCount).reversed().thenComparing(Breakdown::name)).toList();
    }
    private String property(String json, String key) {
        try {
            Object value = objectMapper.readValue(json == null ? "{}" : json, PROPERTIES).get(key);
            return value == null || String.valueOf(value).isBlank() ? null : String.valueOf(value);
        } catch (Exception ignored) { return null; }
    }
    private static void add(Set<String> target, String value) { if (value != null && !value.isBlank()) target.add(value); }
    private static final class Count { long events; final Set<String> users = new LinkedHashSet<>(); void add(String user) { events++; NutritionDashboardService.add(users, user); } }
    private static final class DailyCount { long events; final Set<String> users = new LinkedHashSet<>(); void add(String user) { events++; NutritionDashboardService.add(users, user); } }
    public record Kpis(long eventCount, long uniqueUsers, long screenViews, long foodSearches, long itemSelections, long mealRecords) {}
    public record Breakdown(String name, long eventCount, long uniqueUsers) {}
    public record TrendPoint(String date, long eventCount, long uniqueUsers) {}
    public record Dashboard(Instant from, Instant to, String timezone, Kpis kpis, List<Breakdown> eventDistribution,
                            List<Breakdown> mealDistribution, List<TrendPoint> trend, List<AnalyticsEventRepository.AnalyticsEventRow> recentEvents) {}
}
