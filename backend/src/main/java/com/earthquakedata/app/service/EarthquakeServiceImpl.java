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
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class EarthquakeServiceImpl implements EarthquakeService {

    private final EarthquakeRepository repository;
    private final UsgsApiService usgsApiService;
    private final double magnitudeThreshold;

    public EarthquakeServiceImpl(EarthquakeRepository repository,
                                 UsgsApiService usgsApiService,
                                 @Value("${earthquake.magnitude.threshold}") double magnitudeThreshold) {
        this.repository = repository;
        this.usgsApiService = usgsApiService;
        this.magnitudeThreshold = magnitudeThreshold;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public int fetchAndStore() {
        log.info("Fetching earthquake data from USGS API");
        List<Earthquake> raw = usgsApiService.fetchEarthquakes();

        List<Earthquake> filtered = raw.stream()
                .filter(eq -> eq.getMagnitude() != null && eq.getMagnitude() > magnitudeThreshold)
                .toList();

        log.info("Filtered {} earthquakes with magnitude > {} from {} total",
                filtered.size(), magnitudeThreshold, raw.size());

        List<Earthquake> newEntries = filtered.stream()
                .filter(eq -> !repository.existsByUsgsId(eq.getUsgsId()))
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
    @Transactional(readOnly = true)
    public Page<Earthquake> findAll(Optional<Double> minMag, Optional<Long> afterEpoch, Pageable pageable) {
        Optional<Instant> afterTime = afterEpoch.map(Instant::ofEpochMilli);

        // Always enforce the configured threshold as a floor so sub-threshold
        // records (e.g. ingested before the filter was in place) are never served.
        double effectiveMin = minMag.isPresent()
                ? Math.max(minMag.get(), magnitudeThreshold)
                : magnitudeThreshold;

        if (afterTime.isPresent()) {
            return repository.findByMagnitudeGreaterThanEqualAndTimeAfter(effectiveMin, afterTime.get(), pageable);
        }

        return repository.findByMagnitudeGreaterThanEqual(effectiveMin, pageable);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public Earthquake findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EarthquakeNotFoundException(id));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new EarthquakeNotFoundException(id);
        }
        repository.deleteById(id);
        log.info("Deleted earthquake with id {}", id);
    }
}
