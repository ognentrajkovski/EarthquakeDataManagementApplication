package com.codeit.earthquake.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EarthquakeDto {

    private Long id;
    private String usgsId;
    private Double magnitude;
    private String magType;
    private String place;
    private String title;
    private LocalDateTime time;
    private Double latitude;
    private Double longitude;
    private Double depth;
    private LocalDateTime fetchedAt;
}
