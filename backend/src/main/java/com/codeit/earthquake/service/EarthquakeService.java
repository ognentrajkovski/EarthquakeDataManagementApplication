package com.codeit.earthquake.service;

import com.codeit.earthquake.model.Earthquake;

import java.util.List;
import java.util.Optional;

public interface EarthquakeService {

    /**
     * Fetches earthquake data from the USGS API, filters entries with
     * magnitude greater than 2.0, replaces all existing records in the
     * database with the filtered set, and returns the number of saved records.
     *
     * @return the count of earthquakes saved after filtering
     */
    int fetchAndStore();

    /**
     * Returns all stored earthquakes, optionally filtered by minimum
     * magnitude and/or a minimum time threshold.
     *
     * @param minMag     if present, only earthquakes with magnitude &ge; this value are returned
     * @param afterEpoch if present, only earthquakes occurring after this epoch (ms) are returned
     * @return the filtered list of earthquakes
     */
    List<Earthquake> findAll(Optional<Double> minMag, Optional<Long> afterEpoch);

    /**
     * Retrieves a single earthquake by its database ID.
     *
     * @param id the database primary key
     * @return the matching earthquake
     * @throws com.codeit.earthquake.exception.EarthquakeNotFoundException if no record exists for the given ID
     */
    Earthquake findById(Long id);

    /**
     * Deletes a single earthquake by its database ID.
     *
     * @param id the database primary key
     * @throws com.codeit.earthquake.exception.EarthquakeNotFoundException if no record exists for the given ID
     */
    void deleteById(Long id);
}
