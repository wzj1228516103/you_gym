package com.yougym.api.analytics;

import com.yougym.api.audit.AuditLogService;
import com.yougym.api.config.AdminAccessService;
import com.yougym.api.config.AdminPermission;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/v1/analytics")
public class AnalyticsAdminController {
    private final AnalyticsEventRepository repository;
    private final AdminAccessService accessService;
    private final AuditLogService auditLogService;
    private final AnalyticsDashboardService dashboardService;
    private final NutritionDashboardService nutritionDashboardService;

    public AnalyticsAdminController(AnalyticsEventRepository repository, AdminAccessService accessService,
                                    AuditLogService auditLogService, AnalyticsDashboardService dashboardService,
                                    NutritionDashboardService nutritionDashboardService) {
        this.repository = repository;
        this.accessService = accessService;
        this.auditLogService = auditLogService;
        this.dashboardService = dashboardService;
        this.nutritionDashboardService = nutritionDashboardService;
    }

    @GetMapping("/dashboard")
    public AnalyticsDashboardService.Dashboard dashboard(@RequestParam(required = false) Instant from,
                                                          @RequestParam(required = false) Instant to,
                                                          @RequestParam(defaultValue = "Asia/Shanghai") String timezone,
                                                          HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.ANALYTICS_READ);
        Range range = Range.of(from, to);
        java.time.ZoneId zoneId;
        try {
            zoneId = java.time.ZoneId.of(timezone);
        } catch (java.time.DateTimeException invalid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid timezone");
        }
        auditLogService.record(principal, "ANALYTICS_DASHBOARD_VIEWED", "analytics", null, request,
                Map.of("timezone", zoneId.getId()));
        return dashboardService.dashboard(range.from(), range.to(), zoneId);
    }

    @GetMapping("/summary")
    public Map<String, Object> summary(@RequestParam(required = false) Instant from,
                                       @RequestParam(required = false) Instant to,
                                       HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.ANALYTICS_READ);
        auditLogService.record(principal, "ANALYTICS_SUMMARY_VIEWED", "analytics", null, request, Map.of());
        Range range = Range.of(from, to);
        return Map.of("from", range.from(), "to", range.to(), "items", repository.summarize(range.from(), range.to()));
    }

    @GetMapping("/nutrition")
    public NutritionDashboardService.Dashboard nutrition(@RequestParam(required = false) Instant from,
                                                          @RequestParam(required = false) Instant to,
                                                          @RequestParam(defaultValue = "Asia/Shanghai") String timezone,
                                                          HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.ANALYTICS_READ);
        Range range = Range.of(from, to);
        java.time.ZoneId zoneId;
        try { zoneId = java.time.ZoneId.of(timezone); }
        catch (java.time.DateTimeException invalid) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid timezone"); }
        auditLogService.record(principal, "NUTRITION_ANALYTICS_VIEWED", "nutrition_analytics", null, request, Map.of("timezone", zoneId.getId()));
        return nutritionDashboardService.dashboard(range.from(), range.to(), zoneId);
    }

    @GetMapping(value = "/nutrition.csv", produces = "text/csv")
    public ResponseEntity<byte[]> nutritionCsv(@RequestParam(required = false) Instant from,
                                               @RequestParam(required = false) Instant to,
                                               @RequestParam(defaultValue = "10000") int limit,
                                               HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.ANALYTICS_EXPORT);
        Range range = Range.of(from, to);
        List<AnalyticsEventRepository.AnalyticsEventRow> rows = repository.findNutrition(range.from(), range.to(), Math.max(1, Math.min(limit, 10000)));
        StringBuilder csv = new StringBuilder("eventId,eventName,eventVersion,occurredAt,receivedAt,sessionId,analyticsUserId,platform,appVersion,screenId,propertiesJson\n");
        for (var row : rows) csv.append(String.join(",", quote(row.eventId()), quote(row.eventName()), quote(row.eventVersion()), quote(row.occurredAt()), quote(row.receivedAt()), quote(row.sessionId()), quote(row.analyticsUserId()), quote(row.platform()), quote(row.appVersion()), quote(row.screenId()), quote(row.propertiesJson()))).append('\n');
        auditLogService.record(principal, "NUTRITION_ANALYTICS_EXPORTED", "nutrition_analytics", null, request, Map.of("count", rows.size()));
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=nutrition-events.csv").contentType(MediaType.parseMediaType("text/csv; charset=UTF-8")).body(csv.toString().getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/events")
    public Map<String, Object> events(@RequestParam(required = false) Instant from,
                                      @RequestParam(required = false) Instant to,
                                      @RequestParam(required = false) String eventName,
                                      @RequestParam(defaultValue = "100") int limit,
                                      HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.ANALYTICS_READ);
        auditLogService.record(principal, "ANALYTICS_EVENTS_VIEWED", "analytics", null, request,
                eventName == null ? Map.of() : Map.of("eventName", eventName));
        Range range = Range.of(from, to);
        int safeLimit = Math.max(1, Math.min(limit, 1000));
        return Map.of("from", range.from(), "to", range.to(), "items", repository.find(range.from(), range.to(), eventName, safeLimit));
    }

    @GetMapping(value = "/events.csv", produces = "text/csv")
    public ResponseEntity<byte[]> export(@RequestParam(required = false) Instant from,
                                         @RequestParam(required = false) Instant to,
                                         @RequestParam(required = false) String eventName,
                                         @RequestParam(defaultValue = "10000") int limit,
                                         HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.ANALYTICS_EXPORT);
        auditLogService.record(principal, "ANALYTICS_EVENTS_EXPORTED", "analytics", null, request,
                eventName == null ? Map.of() : Map.of("eventName", eventName));
        Range range = Range.of(from, to);
        List<AnalyticsEventRepository.AnalyticsEventRow> rows = repository.find(range.from(), range.to(), eventName, Math.max(1, Math.min(limit, 10000)));
        StringBuilder csv = new StringBuilder("eventId,eventName,eventVersion,occurredAt,receivedAt,sessionId,analyticsUserId,platform,appVersion,buildNumber,locale,timezone,networkType,screenId,propertiesJson\n");
        for (var row : rows) {
            csv.append(String.join(",", quote(row.eventId()), quote(row.eventName()), quote(row.eventVersion()), quote(row.occurredAt()), quote(row.receivedAt()), quote(row.sessionId()), quote(row.analyticsUserId()), quote(row.platform()), quote(row.appVersion()), quote(row.buildNumber()), quote(row.locale()), quote(row.timezone()), quote(row.networkType()), quote(row.screenId()), quote(row.propertiesJson()))).append('\n');
        }
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=analytics-events.csv").contentType(MediaType.parseMediaType("text/csv; charset=UTF-8")).body(csv.toString().getBytes(StandardCharsets.UTF_8));
    }

    private static String quote(Object value) {
        String text = value == null ? "" : String.valueOf(value);
        return "\"" + text.replace("\"", "\"\"") + "\"";
    }

    private record Range(Instant from, Instant to) {
        static Range of(Instant from, Instant to) {
            Instant resolvedTo = to == null ? Instant.now() : to;
            Instant resolvedFrom = from == null ? resolvedTo.minus(30, ChronoUnit.DAYS) : from;
            if (!resolvedFrom.isBefore(resolvedTo)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "from must be before to");
            return new Range(resolvedFrom, resolvedTo);
        }
    }
}
