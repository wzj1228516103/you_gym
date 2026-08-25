package com.yougym.api.analytics;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {
    private final AnalyticsEventRepository repository;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, RateWindow> rateWindows = new ConcurrentHashMap<>();

    public AnalyticsController(AnalyticsEventRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/events:batch")
    public Map<String, Object> ingest(@Valid @RequestBody BatchRequest request, HttpServletRequest servletRequest) {
        enforceRateLimit(servletRequest == null ? "unknown" : String.valueOf(servletRequest.getRemoteAddr()));
        int accepted = 0;
        int duplicates = 0;
        for (AnalyticsEvent event : request.events()) {
            validateEvent(event);
            if (repository.insert(event)) accepted++; else duplicates++;
        }
        return Map.of("accepted", accepted, "duplicates", duplicates, "total", request.events().size());
    }

    private void validateEvent(AnalyticsEvent event) {
        if (event.eventName().length() > 120 || event.eventId().length() > 100
                || !event.eventName().matches("^[a-z][a-z0-9_.-]{0,119}$")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "event id or name is too long");
        }
        if (event.sessionId() != null && event.sessionId().length() > 100
                || event.analyticsUserId() != null && event.analyticsUserId().length() > 100
                || event.userId() != null && event.userId().length() > 100
                || event.screenId() != null && event.screenId().length() > 120) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "analytics identity fields are too long");
        }
        if (event.properties() != null && event.properties().size() > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "analytics properties contain too many fields");
        }
        try {
            String json = objectMapper.writeValueAsString(event.properties() == null ? Map.of() : event.properties());
            if (json.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 8192) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "analytics properties are too large");
            }
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "analytics properties are invalid");
        }
    }

    private void enforceRateLimit(String clientKey) {
        long now = System.currentTimeMillis();
        rateWindows.compute(clientKey.toLowerCase(Locale.ROOT), (ignored, current) -> {
            if (current == null || now - current.startedAt() >= 60_000) return new RateWindow(now, 1);
            if (current.count() >= 120) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "analytics request rate limit exceeded");
            }
            return new RateWindow(current.startedAt(), current.count() + 1);
        });
        if (rateWindows.size() > 10_000) {
            rateWindows.entrySet().removeIf(entry -> now - entry.getValue().startedAt() >= 60_000);
        }
    }

    private record RateWindow(long startedAt, int count) {}

    public record BatchRequest(@NotEmpty @Size(max = 100) List<@Valid AnalyticsEvent> events) {}
}
