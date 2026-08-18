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
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

@Service
public class AnalyticsDashboardService {
    private static final TypeReference<Map<String, Object>> PROPERTY_MAP = new TypeReference<>() {};
    private static final List<FunnelDefinition> FUNNEL = List.of(
            new FunnelDefinition("body_region_selected", "选择身体区域"),
            new FunnelDefinition("muscle_selected", "选择具体肌群"),
            new FunnelDefinition("exercise_filter_opened", "打开动作筛选"),
            new FunnelDefinition("exercise_detail_viewed", "查看动作详情"),
            new FunnelDefinition("workout_started", "开始训练"),
            new FunnelDefinition("workout_completed", "完成训练")
    );

    private final AnalyticsEventRepository repository;
    private final ObjectMapper objectMapper;

    public AnalyticsDashboardService(AnalyticsEventRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public Dashboard dashboard(Instant from, Instant to, ZoneId zoneId) {
        List<AnalyticsEventRepository.DashboardEventRow> events = repository.findForDashboard(from, to);
        Set<String> users = new LinkedHashSet<>();
        Set<String> sessions = new LinkedHashSet<>();
        Map<String, MutableSeriesPoint> trend = new TreeMap<>();
        Map<String, MutableCount> eventCounts = new LinkedHashMap<>();
        Map<String, MutableCount> platformCounts = new LinkedHashMap<>();
        Map<String, MutableCount> anatomyCounts = new LinkedHashMap<>();
        Map<String, MutableCount> funnelCounts = new LinkedHashMap<>();
        long uploadFailures = 0;

        for (var event : events) {
            addIdentity(users, event.analyticsUserId());
            addIdentity(sessions, event.sessionId());
            String date = LocalDate.ofInstant(event.occurredAt(), zoneId).toString();
            MutableSeriesPoint point = trend.computeIfAbsent(date, ignored -> new MutableSeriesPoint());
            point.eventCount++;
            addIdentity(point.users, event.analyticsUserId());

            eventCounts.computeIfAbsent(event.eventName(), ignored -> new MutableCount())
                    .add(event.analyticsUserId());
            String platform = blankTo(event.platform(), "unknown").toLowerCase(Locale.ROOT);
            platformCounts.computeIfAbsent(platform, ignored -> new MutableCount())
                    .add(event.analyticsUserId());
            funnelCounts.computeIfAbsent(event.eventName(), ignored -> new MutableCount())
                    .add(event.analyticsUserId());
            if ("analytics_upload_failed".equals(event.eventName())) uploadFailures++;

            if ("body_region_selected".equals(event.eventName()) || "muscle_selected".equals(event.eventName())) {
                Map<String, Object> properties = properties(event.propertiesJson());
                String label = firstNonBlank(properties, "muscle", "region", "group", "part");
                if (label != null) anatomyCounts.computeIfAbsent(label, ignored -> new MutableCount())
                        .add(event.analyticsUserId());
            }
        }

        List<TrendPoint> trendPoints = trend.entrySet().stream()
                .map(entry -> new TrendPoint(entry.getKey(), entry.getValue().eventCount, entry.getValue().users.size()))
                .toList();
        List<BreakdownItem> eventDistribution = ranked(eventCounts, 12);
        List<BreakdownItem> platformDistribution = ranked(platformCounts, 8);
        List<BreakdownItem> anatomyRanking = ranked(anatomyCounts, 10);
        List<FunnelItem> funnel = FUNNEL.stream().map(step -> {
            MutableCount count = funnelCounts.getOrDefault(step.eventName(), new MutableCount());
            return new FunnelItem(step.eventName(), step.label(), count.count, count.users.size());
        }).toList();
        double failureRate = events.isEmpty() ? 0 : (double) uploadFailures / events.size();

        return new Dashboard(from, to, zoneId.getId(),
                new Kpis(events.size(), users.size(), sessions.size(), uploadFailures, failureRate),
                trendPoints, eventDistribution, anatomyRanking, funnel, platformDistribution);
    }

    private List<BreakdownItem> ranked(Map<String, MutableCount> values, int limit) {
        return values.entrySet().stream()
                .map(entry -> new BreakdownItem(entry.getKey(), entry.getValue().count, entry.getValue().users.size()))
                .sorted(Comparator.comparingLong(BreakdownItem::eventCount).reversed().thenComparing(BreakdownItem::name))
                .limit(limit)
                .toList();
    }

    private Map<String, Object> properties(String json) {
        try {
            return json == null || json.isBlank() ? Map.of() : objectMapper.readValue(json, PROPERTY_MAP);
        } catch (Exception ignored) {
            return Map.of();
        }
    }

    private static String firstNonBlank(Map<String, Object> properties, String... keys) {
        for (String key : keys) {
            Object value = properties.get(key);
            if (value != null && !String.valueOf(value).isBlank()) return String.valueOf(value);
        }
        return null;
    }

    private static void addIdentity(Set<String> target, String value) {
        if (value != null && !value.isBlank()) target.add(value);
    }

    private static String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static class MutableSeriesPoint {
        long eventCount;
        final Set<String> users = new LinkedHashSet<>();
    }

    private static class MutableCount {
        long count;
        final Set<String> users = new LinkedHashSet<>();
        void add(String userId) { count++; addIdentity(users, userId); }
    }

    private record FunnelDefinition(String eventName, String label) {}
    public record Kpis(long eventCount, long uniqueDevices, long sessionCount, long uploadFailureCount, double uploadFailureRate) {}
    public record TrendPoint(String date, long eventCount, long uniqueDevices) {}
    public record BreakdownItem(String name, long eventCount, long uniqueDevices) {}
    public record FunnelItem(String eventName, String label, long eventCount, long uniqueDevices) {}
    public record Dashboard(Instant from, Instant to, String timezone, Kpis kpis, List<TrendPoint> trend,
                            List<BreakdownItem> eventDistribution, List<BreakdownItem> anatomyRanking,
                            List<FunnelItem> funnel, List<BreakdownItem> platformDistribution) {}
}
