package com.earthquakedata.app.dto;

import com.earthquakedata.app.model.Earthquake;
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

    public static EarthquakeDto fromEntity(Earthquake entity) {
        return EarthquakeDto.builder()
                .id(entity.getId())
                .usgsId(entity.getUsgsId())
                .magnitude(entity.getMagnitude())
                .magType(entity.getMagType())
                .place(entity.getPlace())
                .title(entity.getTitle())
                .time(entity.getTime())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .depth(entity.getDepth())
                .fetchedAt(entity.getFetchedAt())
                .build();
    }
}
