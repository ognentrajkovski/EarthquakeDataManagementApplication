package com.earthquakedata.app.service;

import com.earthquakedata.app.exception.EarthquakeNotFoundException;
import com.earthquakedata.app.model.Earthquake;
import com.earthquakedata.app.repository.EarthquakeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EarthquakeServiceImpl implements EarthquakeService {

    /** Minimum magnitude to persist — wired from application properties. */
    @Value("${earthquake.magnitude.threshold:2.0}")
    private double magnitudeThreshold;

    private final EarthquakeRepository repository;
    private final UsgsApiService usgsApiService;

    /**
     * {@inheritDoc}
     */
    @Override
    public int fetchAndStore() {
        log.info("Fetching earthquake data from USGS API");
        List<Earthquake> raw = usgsApiService.fetchEarthquakes();

        List<Earthquake> filtered = raw.stream()
                .filter(eq -> eq.getMagnitude() != null && eq.getMagnitude() > magnitudeThreshold)
                .toList();

        log.info("Filtered {} earthquakes with magnitude > {} from {} total",
                filtered.size(), magnitudeThreshold, raw.size());

        // --- Single-query duplicate check (eliminates N+1 pattern) ---
        Set<String> incomingUsgsIds = filtered.stream()
                .map(Earthquake::getUsgsId)
                .collect(Collectors.toSet());

        Set<String> existingUsgsIds = repository.findByUsgsIdIn(incomingUsgsIds)
                .stream()
                .map(Earthquake::getUsgsId)
                .collect(Collectors.toSet());

        List<Earthquake> newEntries = filtered.stream()
                .filter(eq -> !existingUsgsIds.contains(eq.getUsgsId()))
                .toList();

        List<Earthquake> saved = repository.saveAll(newEntries);

        log.info("Saved {} new earthquakes to database ({} duplicates skipped)",
                saved.size(), filtered.size() - saved.size());
        return saved.size();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Page<Earthquake> findAll(Optional<Double> minMag, Optional<Long> afterEpoch, Pageable pageable) {
        Optional<Instant> afterTime = afterEpoch.map(Instant::ofEpochMilli);

        if (minMag.isPresent() && afterTime.isPresent()) {
            return repository.findByMagnitudeGreaterThanEqualAndTimeAfter(minMag.get(), afterTime.get(), pageable);
        } else if (minMag.isPresent()) {
            return repository.findByMagnitudeGreaterThanEqual(minMag.get(), pageable);
        } else if (afterTime.isPresent()) {
            return repository.findByTimeAfter(afterTime.get(), pageable);
        }

        return repository.findAll(pageable);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Earthquake findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new EarthquakeNotFoundException(id));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void deleteById(String id) {
        if (!repository.existsById(id)) {
            throw new EarthquakeNotFoundException(id);
        }
        repository.deleteById(id);
        log.info("Deleted earthquake with id {}", id);
    }
}
