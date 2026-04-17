package com.earthquakedata.app.service;

import com.earthquakedata.app.exception.EarthquakeNotFoundException;
import com.earthquakedata.app.model.Earthquake;
import com.earthquakedata.app.repository.EarthquakeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
class EarthquakeServiceIntegrationTest {

    @Autowired
    private EarthquakeService earthquakeService;

    @Autowired
    private EarthquakeRepository repository;

    @MockitoBean
    private UsgsApiService usgsApiService;

    private static final Instant TIME_OLD    = Instant.parse("2024-01-01T00:00:00Z");
    private static final Instant TIME_RECENT = Instant.parse("2025-06-15T12:00:00Z");

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Test
    void fetchAndStore_filtersLowMagnitudeAndSkipsDuplicates() {
        // Pre-existing record that should be preserved
        repository.save(Earthquake.builder()
                .usgsId("eq-high")
                .magnitude(5.5)
                .place("Already stored")
                .time(TIME_OLD)
                .latitude(0.0).longitude(0.0).depth(10.0)
                .fetchedAt(TIME_OLD)
                .build());

        // Mock USGS returning 3 earthquakes: mag 1.5 (below threshold), 3.0, 5.5 (duplicate)
        List<Earthquake> usgsData = List.of(
                Earthquake.builder()
                        .usgsId("eq-low")
                        .magnitude(1.5)
                        .magType("ml")
                        .place("Low mag place")
                        .title("M 1.5 - Low")
                        .time(TIME_RECENT)
                        .latitude(34.0).longitude(-118.0).depth(10.0)
                        .fetchedAt(TIME_RECENT)
                        .build(),
                Earthquake.builder()
                        .usgsId("eq-mid")
                        .magnitude(3.0)
                        .magType("ml")
                        .place("Mid mag place")
                        .title("M 3.0 - Mid")
                        .time(TIME_RECENT)
                        .latitude(35.0).longitude(-117.0).depth(15.0)
                        .fetchedAt(TIME_RECENT)
                        .build(),
                Earthquake.builder()
                        .usgsId("eq-high")
                        .magnitude(5.5)
                        .magType("mw")
                        .place("High mag place")
                        .title("M 5.5 - High")
                        .time(TIME_RECENT)
                        .latitude(36.0).longitude(-116.0).depth(20.0)
                        .fetchedAt(TIME_RECENT)
                        .build()
        );
        when(usgsApiService.fetchEarthquakes()).thenReturn(usgsData);

        int count = earthquakeService.fetchAndStore();

        // Only eq-mid is new (eq-low filtered by mag, eq-high already exists)
        assertThat(count).isEqualTo(1);
        List<Earthquake> all = repository.findAll();
        assertThat(all).hasSize(2);
        assertThat(all).extracting(Earthquake::getUsgsId)
                .containsExactlyInAnyOrder("eq-high", "eq-mid");
    }

    @Test
    void findAll_withMinMagFilter_returnsCorrectSubset() {
        repository.saveAll(List.of(
                Earthquake.builder().usgsId("a").magnitude(2.5).time(TIME_RECENT)
                        .latitude(0.0).longitude(0.0).depth(0.0).fetchedAt(TIME_RECENT).build(),
                Earthquake.builder().usgsId("b").magnitude(4.0).time(TIME_RECENT)
                        .latitude(0.0).longitude(0.0).depth(0.0).fetchedAt(TIME_RECENT).build(),
                Earthquake.builder().usgsId("c").magnitude(6.0).time(TIME_RECENT)
                        .latitude(0.0).longitude(0.0).depth(0.0).fetchedAt(TIME_RECENT).build()
        ));

        Page<Earthquake> result = earthquakeService.findAll(Optional.of(4.0), Optional.empty(), PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).extracting(Earthquake::getUsgsId)
                .containsExactlyInAnyOrder("b", "c");
    }

    @Test
    void findAll_withAfterEpochFilter_returnsCorrectSubset() {
        repository.saveAll(List.of(
                Earthquake.builder().usgsId("old").magnitude(3.0).time(TIME_OLD)
                        .latitude(0.0).longitude(0.0).depth(0.0).fetchedAt(TIME_OLD).build(),
                Earthquake.builder().usgsId("new").magnitude(3.0).time(TIME_RECENT)
                        .latitude(0.0).longitude(0.0).depth(0.0).fetchedAt(TIME_RECENT).build()
        ));

        // Cutoff between the two: 2025-01-01T00:00:00Z
        long cutoffEpoch = Instant.parse("2025-01-01T00:00:00Z").toEpochMilli();

        Page<Earthquake> result = earthquakeService.findAll(Optional.empty(), Optional.of(cutoffEpoch), PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getUsgsId()).isEqualTo("new");
    }

    @Test
    void findById_found_returnsEarthquake() {
        Earthquake saved = repository.save(Earthquake.builder()
                .usgsId("find-me").magnitude(3.5).time(TIME_RECENT)
                .latitude(0.0).longitude(0.0).depth(0.0).fetchedAt(TIME_RECENT)
                .build());

        Earthquake found = earthquakeService.findById(saved.getId());

        assertThat(found.getUsgsId()).isEqualTo("find-me");
    }

    @Test
    void findById_notFound_throwsException() {
        assertThatThrownBy(() -> earthquakeService.findById(999L))
                .isInstanceOf(EarthquakeNotFoundException.class);
    }

    @Test
    void deleteById_found_deletesRecord() {
        Earthquake saved = repository.save(Earthquake.builder()
                .usgsId("delete-me").magnitude(3.0).time(TIME_RECENT)
                .latitude(0.0).longitude(0.0).depth(0.0).fetchedAt(TIME_RECENT)
                .build());

        earthquakeService.deleteById(saved.getId());

        assertThat(repository.findById(saved.getId())).isEmpty();
    }

    @Test
    void deleteById_notFound_throwsException() {
        assertThatThrownBy(() -> earthquakeService.deleteById(999L))
                .isInstanceOf(EarthquakeNotFoundException.class);
    }
}
