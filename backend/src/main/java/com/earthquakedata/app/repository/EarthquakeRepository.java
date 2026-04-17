package com.earthquakedata.app.repository;

import com.earthquakedata.app.model.Earthquake;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface EarthquakeRepository extends JpaRepository<Earthquake, Long> {

    boolean existsByUsgsId(String usgsId);

    Page<Earthquake> findByMagnitudeGreaterThanEqual(Double minMag, Pageable pageable);

    Page<Earthquake> findByTimeAfter(Instant after, Pageable pageable);

    Page<Earthquake> findByMagnitudeGreaterThanEqualAndTimeAfter(Double minMag, Instant after, Pageable pageable);
}
