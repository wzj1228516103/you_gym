package com.yougym.api.analytics;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {
    private final AnalyticsEventRepository repository;

    public AnalyticsController(AnalyticsEventRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/events:batch")
    public Map<String, Object> ingest(@Valid @RequestBody BatchRequest request) {
        int accepted = 0;
        int duplicates = 0;
        for (AnalyticsEvent event : request.events()) {
            if (event.eventName().length() > 120 || event.eventId().length() > 100) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "event id or name is too long");
            }
            if (repository.insert(event)) accepted++; else duplicates++;
        }
        return Map.of("accepted", accepted, "duplicates", duplicates, "total", request.events().size());
    }

    public record BatchRequest(@NotEmpty @Size(max = 100) List<@Valid AnalyticsEvent> events) {}
}
