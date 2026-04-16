package com.earthquakedata.app.repository;

import com.earthquakedata.app.model.Earthquake;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EarthquakeRepository extends JpaRepository<Earthquake, Long> {

    boolean existsByUsgsId(String usgsId);

    List<Earthquake> findByMagnitudeGreaterThanEqual(Double minMag);

    List<Earthquake> findByTimeAfter(LocalDateTime after);

    List<Earthquake> findByMagnitudeGreaterThanEqualAndTimeAfter(Double minMag, LocalDateTime after);
}
