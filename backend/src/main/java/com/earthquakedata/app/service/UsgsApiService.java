package com.earthquakedata.app.service;

import com.earthquakedata.app.dto.GeoJsonResponse;
import com.earthquakedata.app.exception.ExternalApiException;
import com.earthquakedata.app.model.Earthquake;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsgsApiService {

    private final RestTemplate restTemplate;

    @Value("${usgs.api.url}")
    private String usgsApiUrl;

    /**
     * Fetches the latest earthquake data from the USGS GeoJSON feed and maps
     * each valid feature to an {@link Earthquake} entity.
     *
     * <p>Malformed entries (missing properties, geometry, or coordinates) are
     * skipped with a warning log. The {@code fetchedAt} timestamp is set to
     * the current UTC time for every returned entity.</p>
     *
     * @return a list of {@link Earthquake} entities parsed from the USGS feed;
     *         never {@code null}, but may be empty if no valid features exist
     * @throws ExternalApiException if the HTTP call to USGS fails or the
     *                              response cannot be parsed
     */
    public List<Earthquake> fetchEarthquakes() {
        GeoJsonResponse response;
        try {
            response = restTemplate.getForObject(usgsApiUrl, GeoJsonResponse.class);
        } catch (RestClientException ex) {
            throw new ExternalApiException("Failed to fetch data from USGS API", ex);
        }

        if (response == null || response.getFeatures() == null) {
            log.warn("USGS API returned null response or null features list");
            return Collections.emptyList();
        }

        LocalDateTime fetchedAt = LocalDateTime.now(ZoneOffset.UTC);

        List<Earthquake> earthquakes = response.getFeatures().stream()
                .map(feature -> {
                    try {
                        return mapFeatureToEarthquake(feature, fetchedAt);
                    } catch (Exception ex) {
                        log.warn("Skipping malformed feature [id={}]: {}", feature.getId(), ex.getMessage());
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .toList();

        log.info("Fetched {} valid earthquakes from USGS", earthquakes.size());
        return earthquakes;
    }

    /**
     * Maps a single GeoJSON feature to an {@link Earthquake} entity.
     *
     * @param feature   the GeoJSON feature to map
     * @param fetchedAt the timestamp to record as the fetch time
     * @return the mapped entity, or {@code null} if the feature is malformed
     */
    private Earthquake mapFeatureToEarthquake(GeoJsonResponse.Feature feature, LocalDateTime fetchedAt) {
        if (feature.getProperties() == null) {
            log.warn("Skipping feature [id={}]: missing properties", feature.getId());
            return null;
        }

        if (feature.getGeometry() == null || feature.getGeometry().getCoordinates() == null
                || feature.getGeometry().getCoordinates().size() < 3) {
            log.warn("Skipping feature [id={}]: missing or incomplete geometry", feature.getId());
            return null;
        }

        GeoJsonResponse.Properties props = feature.getProperties();
        List<Double> coords = feature.getGeometry().getCoordinates();

        LocalDateTime time = null;
        if (props.getTime() != null) {
            time = LocalDateTime.ofInstant(Instant.ofEpochMilli(props.getTime()), ZoneOffset.UTC);
        }

        return Earthquake.builder()
                .usgsId(feature.getId())
                .magnitude(props.getMag())
                .magType(props.getMagType())
                .place(props.getPlace())
                .title(props.getTitle())
                .time(time)
                .longitude(coords.get(0))
                .latitude(coords.get(1))
                .depth(coords.get(2))
                .fetchedAt(fetchedAt)
                .build();
    }
}
