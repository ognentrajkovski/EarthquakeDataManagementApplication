package com.earthquakedata.app.service;

import com.earthquakedata.app.dto.GeoJsonResponse;
import com.earthquakedata.app.exception.ExternalApiException;
import com.earthquakedata.app.model.Earthquake;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsgsApiServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private UsgsApiService usgsApiService;

    private static final String API_URL = "https://earthquake.usgs.gov/test";

    @BeforeEach
    void setUp() throws Exception {
        usgsApiService = new UsgsApiService(restTemplate);
        Field urlField = UsgsApiService.class.getDeclaredField("usgsApiUrl");
        urlField.setAccessible(true);
        urlField.set(usgsApiService, API_URL);
    }

    private GeoJsonResponse.Feature validFeature(String id, Double mag, String place, Long time) {
        GeoJsonResponse.Properties props = new GeoJsonResponse.Properties();
        props.setMag(mag);
        props.setMagType("ml");
        props.setPlace(place);
        props.setTitle("M " + mag + " - " + place);
        props.setTime(time);

        GeoJsonResponse.Geometry geom = new GeoJsonResponse.Geometry();
        geom.setCoordinates(Arrays.asList(-118.0, 34.0, 10.0));

        GeoJsonResponse.Feature feature = new GeoJsonResponse.Feature();
        feature.setId(id);
        feature.setProperties(props);
        feature.setGeometry(geom);
        return feature;
    }

    @Test
    void fetchEarthquakes_parsesValidFeatures() {
        GeoJsonResponse response = new GeoJsonResponse();
        response.setFeatures(List.of(
                validFeature("eq1", 3.5, "Place A", 1700000000000L),
                validFeature("eq2", 5.0, "Place B", 1700001000000L)
        ));
        when(restTemplate.getForObject(eq(API_URL), eq(GeoJsonResponse.class))).thenReturn(response);

        List<Earthquake> result = usgsApiService.fetchEarthquakes();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getUsgsId()).isEqualTo("eq1");
        assertThat(result.get(0).getMagnitude()).isEqualTo(3.5);
        assertThat(result.get(0).getPlace()).isEqualTo("Place A");
        assertThat(result.get(0).getLongitude()).isEqualTo(-118.0);
        assertThat(result.get(0).getLatitude()).isEqualTo(34.0);
        assertThat(result.get(0).getDepth()).isEqualTo(10.0);
        assertThat(result.get(0).getTime()).isNotNull();
        assertThat(result.get(0).getFetchedAt()).isNotNull();
    }

    @Test
    void fetchEarthquakes_skipsFeatureWithNullProperties() {
        GeoJsonResponse.Feature noProps = new GeoJsonResponse.Feature();
        noProps.setId("bad1");
        noProps.setProperties(null);
        noProps.setGeometry(new GeoJsonResponse.Geometry());

        GeoJsonResponse response = new GeoJsonResponse();
        response.setFeatures(List.of(noProps, validFeature("good", 2.0, "OK", 1700000000000L)));
        when(restTemplate.getForObject(eq(API_URL), eq(GeoJsonResponse.class))).thenReturn(response);

        List<Earthquake> result = usgsApiService.fetchEarthquakes();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUsgsId()).isEqualTo("good");
    }

    @Test
    void fetchEarthquakes_skipsFeatureWithNullGeometry() {
        GeoJsonResponse.Feature noGeom = new GeoJsonResponse.Feature();
        noGeom.setId("bad2");
        noGeom.setProperties(new GeoJsonResponse.Properties());
        noGeom.setGeometry(null);

        GeoJsonResponse response = new GeoJsonResponse();
        response.setFeatures(List.of(noGeom, validFeature("good", 2.0, "OK", 1700000000000L)));
        when(restTemplate.getForObject(eq(API_URL), eq(GeoJsonResponse.class))).thenReturn(response);

        List<Earthquake> result = usgsApiService.fetchEarthquakes();

        assertThat(result).hasSize(1);
    }

    @Test
    void fetchEarthquakes_skipsFeatureWithIncompleteCoordinates() {
        GeoJsonResponse.Geometry partialGeom = new GeoJsonResponse.Geometry();
        partialGeom.setCoordinates(Arrays.asList(-118.0, 34.0)); // only 2 instead of 3

        GeoJsonResponse.Feature partial = new GeoJsonResponse.Feature();
        partial.setId("bad3");
        partial.setProperties(new GeoJsonResponse.Properties());
        partial.setGeometry(partialGeom);

        GeoJsonResponse response = new GeoJsonResponse();
        response.setFeatures(List.of(partial));
        when(restTemplate.getForObject(eq(API_URL), eq(GeoJsonResponse.class))).thenReturn(response);

        List<Earthquake> result = usgsApiService.fetchEarthquakes();

        assertThat(result).isEmpty();
    }

    @Test
    void fetchEarthquakes_handlesNullTime() {
        GeoJsonResponse response = new GeoJsonResponse();
        response.setFeatures(List.of(validFeature("eq-null-time", 3.0, "Place", null)));
        when(restTemplate.getForObject(eq(API_URL), eq(GeoJsonResponse.class))).thenReturn(response);

        List<Earthquake> result = usgsApiService.fetchEarthquakes();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTime()).isNull();
    }

    @Test
    void fetchEarthquakes_returnsEmptyListWhenResponseIsNull() {
        when(restTemplate.getForObject(eq(API_URL), eq(GeoJsonResponse.class))).thenReturn(null);

        List<Earthquake> result = usgsApiService.fetchEarthquakes();

        assertThat(result).isEmpty();
    }

    @Test
    void fetchEarthquakes_returnsEmptyListWhenFeaturesIsNull() {
        GeoJsonResponse response = new GeoJsonResponse();
        response.setFeatures(null);
        when(restTemplate.getForObject(eq(API_URL), eq(GeoJsonResponse.class))).thenReturn(response);

        List<Earthquake> result = usgsApiService.fetchEarthquakes();

        assertThat(result).isEmpty();
    }

    @Test
    void fetchEarthquakes_returnsEmptyListWhenFeaturesIsEmpty() {
        GeoJsonResponse response = new GeoJsonResponse();
        response.setFeatures(Collections.emptyList());
        when(restTemplate.getForObject(eq(API_URL), eq(GeoJsonResponse.class))).thenReturn(response);

        List<Earthquake> result = usgsApiService.fetchEarthquakes();

        assertThat(result).isEmpty();
    }

    @Test
    void fetchEarthquakes_throwsExternalApiExceptionOnRestClientError() {
        when(restTemplate.getForObject(eq(API_URL), eq(GeoJsonResponse.class)))
                .thenThrow(new RestClientException("Connection refused"));

        assertThatThrownBy(() -> usgsApiService.fetchEarthquakes())
                .isInstanceOf(ExternalApiException.class)
                .hasMessageContaining("Failed to fetch data from USGS API")
                .hasCauseInstanceOf(RestClientException.class);
    }
}
