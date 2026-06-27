package com.earthquakedata.app.service;

import com.earthquakedata.app.model.Earthquake;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface EarthquakeService {

    /**
     * Fetches earthquake data from the USGS API, filters entries with
     * magnitude greater than the configured threshold, skips entries
     * already present in the database, and returns the number of newly
     * saved records.
     *
     * @return the count of earthquakes saved after filtering
     */
    int fetchAndStore();

    /**
     * Returns a page of stored earthquakes, optionally filtered by minimum
     * magnitude and/or a minimum time threshold.
     *
     * @param minMag     if present, only earthquakes with magnitude &ge; this value are returned
     * @param afterEpoch if present, only earthquakes occurring after this epoch (ms) are returned
     * @param pageable   pagination and sorting parameters
     * @return a page of filtered earthquakes
     */
    Page<Earthquake> findAll(Optional<Double> minMag, Optional<Long> afterEpoch, Pageable pageable);

    /**
     * Retrieves a single earthquake by its database ID.
     *
     * @param id the database primary key (MongoDB ObjectId string)
     * @return the matching earthquake
     * @throws com.earthquakedata.app.exception.EarthquakeNotFoundException if no record exists for the given ID
     */
    Earthquake findById(String id);

    /**
     * Deletes a single earthquake by its database ID.
     *
     * @param id the database primary key (MongoDB ObjectId string)
     * @throws com.earthquakedata.app.exception.EarthquakeNotFoundException if no record exists for the given ID
     */
    void deleteById(String id);
}
