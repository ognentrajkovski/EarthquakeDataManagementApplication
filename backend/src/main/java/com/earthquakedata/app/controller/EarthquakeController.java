package com.earthquakedata.app.controller;

import com.earthquakedata.app.dto.EarthquakeDto;
import com.earthquakedata.app.service.EarthquakeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/earthquakes")
@RequiredArgsConstructor
public class EarthquakeController {

    private final EarthquakeService earthquakeService;

    @PostMapping("/fetch")
    public ResponseEntity<Map<String, Object>> fetchFromUsgs() {
        int count = earthquakeService.fetchAndStore();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping
    public ResponseEntity<Page<EarthquakeDto>> getAll(
            @RequestParam Optional<Double> minMag,
            @RequestParam Optional<Long> after,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "time"));
        Page<EarthquakeDto> earthquakes = earthquakeService.findAll(minMag, after, pageable)
                .map(EarthquakeDto::fromEntity);
        return ResponseEntity.ok(earthquakes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EarthquakeDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(EarthquakeDto.fromEntity(earthquakeService.findById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        earthquakeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
