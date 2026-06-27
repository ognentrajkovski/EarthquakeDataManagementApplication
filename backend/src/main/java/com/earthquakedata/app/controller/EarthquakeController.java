package com.earthquakedata.app.controller;

import com.earthquakedata.app.dto.EarthquakeDto;
import com.earthquakedata.app.service.EarthquakeService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/earthquakes")
@RequiredArgsConstructor
@Validated
public class EarthquakeController {

    /** Hard upper bound on page size to prevent memory exhaustion. */
    private static final int MAX_PAGE_SIZE = 200;

    private final EarthquakeService earthquakeService;

    @PostMapping("/fetch")
    public ResponseEntity<Map<String, Object>> fetchFromUsgs() {
        int count = earthquakeService.fetchAndStore();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping
    public ResponseEntity<Page<EarthquakeDto>> getAll(
            @RequestParam Optional<@Min(0) @Max(10) Double> minMag,
            @RequestParam Optional<@Positive Long> after,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(MAX_PAGE_SIZE) int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "time"));
        Page<EarthquakeDto> earthquakes = earthquakeService.findAll(minMag, after, pageable)
                .map(EarthquakeDto::fromEntity);
        return ResponseEntity.ok(earthquakes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EarthquakeDto> getById(@PathVariable String id) {
        return ResponseEntity.ok(EarthquakeDto.fromEntity(earthquakeService.findById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable String id) {
        earthquakeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
