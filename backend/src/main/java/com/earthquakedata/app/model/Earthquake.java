package com.earthquakedata.app.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

/**
 * MongoDB document representing a single seismic event.
 *
 * <p>{@code usgsId} carries a unique index so that duplicate ingestion is
 * detected at the database level as well as in the service layer.</p>
 */
@Document(collection = "earthquakes")
@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Earthquake {

    /** MongoDB ObjectId — assigned by the driver on first insert. */
    @Id
    private String id;

    /** USGS feature identifier — natural business key, must be unique. */
    @Indexed(unique = true)
    @EqualsAndHashCode.Include
    @Field("usgs_id")
    private String usgsId;

    private Double magnitude;

    @Field("mag_type")
    private String magType;

    private String place;

    private String title;

    /** Event time reported by USGS. */
    private Instant time;

    private Double latitude;

    private Double longitude;

    private Double depth;

    /** Timestamp recorded when this document was fetched from USGS. */
    @Field("fetched_at")
    private Instant fetchedAt;
}
