package com.earthquakedata.app.repository;

import com.earthquakedata.app.model.Earthquake;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Repository
public interface EarthquakeRepository extends MongoRepository<Earthquake, String> {

    boolean existsByUsgsId(String usgsId);

    /**
     * Returns only the {@code usgsId} field for all documents whose
     * {@code usgsId} matches one of the supplied values.
     *
     * <p>Used by the service layer to perform a single-query duplicate check
     * instead of one {@code EXISTS} call per earthquake (N+1 anti-pattern).</p>
     */
    @Query(value = "{ 'usgs_id': { $in: ?0 } }", fields = "{ 'usgs_id': 1 }")
    List<Earthquake> findByUsgsIdIn(Collection<String> usgsIds);

    Page<Earthquake> findByMagnitudeGreaterThanEqual(Double minMag, Pageable pageable);

    Page<Earthquake> findByTimeAfter(Instant after, Pageable pageable);

    Page<Earthquake> findByMagnitudeGreaterThanEqualAndTimeAfter(Double minMag, Instant after, Pageable pageable);
}
