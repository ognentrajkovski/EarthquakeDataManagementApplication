package com.earthquakedata.app.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Polls the USGS API on a fixed interval and persists any new earthquakes.
 *
 * <p>Enabled by default; disable by setting {@code earthquake.polling.enabled=false}
 * (e.g. in tests). The interval is controlled by {@code earthquake.polling.interval-ms}.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "earthquake.polling.enabled", havingValue = "true", matchIfMissing = true)
public class EarthquakePollingScheduler {

    private final EarthquakeService earthquakeService;

    /**
     * Triggers {@link EarthquakeService#fetchAndStore()} on a fixed delay.
     * Exceptions are caught and logged so a transient USGS outage does not kill the scheduler.
     */
    @Scheduled(
            fixedDelayString = "${earthquake.polling.interval-ms:60000}",
            initialDelayString = "${earthquake.polling.initial-delay-ms:5000}"
    )
    public void pollUsgs() {
        try {
            int saved = earthquakeService.fetchAndStore();
            if (saved > 0) {
                log.info("Scheduled USGS poll stored {} new earthquakes", saved);
            } else {
                log.debug("Scheduled USGS poll — no new earthquakes");
            }
        } catch (Exception ex) {
            log.warn("Scheduled USGS poll failed: {}", ex.getMessage());
        }
    }

    @Value("${earthquake.polling.interval-ms:60000}")
    private long intervalMs;

    /** Exposed for logging / diagnostics. */
    public long getIntervalMs() {
        return intervalMs;
    }
}
