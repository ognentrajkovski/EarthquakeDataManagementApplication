package com.earthquakedata.app.service;

import com.earthquakedata.app.exception.EarthquakeNotFoundException;
import com.earthquakedata.app.model.Earthquake;
import com.earthquakedata.app.repository.EarthquakeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EarthquakeServiceImpl implements EarthquakeService {

    private static final double MAGNITUDE_THRESHOLD = 2.0;

    private final EarthquakeRepository repository;
    private final UsgsApiService usgsApiService;

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public int fetchAndStore() {
        log.info("Fetching earthquake data from USGS API");
        List<Earthquake> raw = usgsApiService.fetchEarthquakes();

        List<Earthquake> filtered = raw.stream()
                .filter(eq -> eq.getMagnitude() != null && eq.getMagnitude() > MAGNITUDE_THRESHOLD)
                .toList();

        log.info("Filtered {} earthquakes with magnitude > {} from {} total",
                filtered.size(), MAGNITUDE_THRESHOLD, raw.size());

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
        Optional<LocalDateTime> afterTime = afterEpoch.map(epoch ->
                LocalDateTime.ofInstant(Instant.ofEpochMilli(epoch), ZoneOffset.UTC));

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
