package com.earthquakedata.app.controller;

import com.earthquakedata.app.model.Earthquake;
import com.earthquakedata.app.service.EarthquakeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    public ResponseEntity<List<Earthquake>> getAll(
            @RequestParam Optional<Double> minMag,
            @RequestParam Optional<Long> after) {
        List<Earthquake> earthquakes = earthquakeService.findAll(minMag, after);
        return ResponseEntity.ok(earthquakes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Earthquake> getById(@PathVariable Long id) {
        return ResponseEntity.ok(earthquakeService.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        earthquakeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
