package com.earthquakedata.app.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EarthquakePollingSchedulerTest {

    @Mock
    private EarthquakeService earthquakeService;

    @InjectMocks
    private EarthquakePollingScheduler scheduler;

    @Test
    void pollUsgs_delegatesToService() {
        when(earthquakeService.fetchAndStore()).thenReturn(3);

        scheduler.pollUsgs();

        verify(earthquakeService, times(1)).fetchAndStore();
    }

    @Test
    void pollUsgs_swallowsExceptionsSoSchedulerKeepsRunning() {
        doThrow(new RuntimeException("USGS down")).when(earthquakeService).fetchAndStore();

        // Must not propagate — otherwise the scheduler would stop firing.
        scheduler.pollUsgs();

        verify(earthquakeService).fetchAndStore();
    }
}
