package com.codeit.earthquake.repository;

import com.codeit.earthquake.model.Earthquake;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EarthquakeRepository extends JpaRepository<Earthquake, Long> {

    List<Earthquake> findByMagnitudeGreaterThanEqual(Double minMag);

    List<Earthquake> findByTimeAfter(LocalDateTime after);

    List<Earthquake> findByMagnitudeGreaterThanEqualAndTimeAfter(Double minMag, LocalDateTime after);
}
