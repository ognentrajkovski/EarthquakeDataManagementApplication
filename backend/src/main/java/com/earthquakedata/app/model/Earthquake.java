package com.earthquakedata.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "earthquakes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Earthquake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usgs_id", unique = true)
    private String usgsId;

    private Double magnitude;

    @Column(name = "mag_type", length = 50)
    private String magType;

    @Column(length = 512)
    private String place;

    @Column(length = 512)
    private String title;

    private LocalDateTime time;

    private Double latitude;

    private Double longitude;

    private Double depth;

    @Column(name = "fetched_at")
    private LocalDateTime fetchedAt;
}
