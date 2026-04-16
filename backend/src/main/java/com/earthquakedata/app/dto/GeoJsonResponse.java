package com.earthquakedata.app.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeoJsonResponse {

    private List<Feature> features;

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Feature {
        private String id;
        private Properties properties;
        private Geometry geometry;
    }

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Properties {
        private Double mag;
        private String magType;
        private String place;
        private String title;
        private Long time;
    }

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Geometry {
        /** coordinates: [longitude, latitude, depth] */
        private List<Double> coordinates;
    }
}
