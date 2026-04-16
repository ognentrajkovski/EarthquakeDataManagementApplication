package com.earthquakedata.app.controller;

import com.earthquakedata.app.exception.EarthquakeNotFoundException;
import com.earthquakedata.app.exception.GlobalExceptionHandler;
import com.earthquakedata.app.model.Earthquake;
import com.earthquakedata.app.service.EarthquakeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({EarthquakeController.class, GlobalExceptionHandler.class})
class EarthquakeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EarthquakeService earthquakeService;

    private static final LocalDateTime NOW = LocalDateTime.of(2025, 6, 15, 12, 0, 0);

    private Earthquake sampleEarthquake(Long id) {
        return Earthquake.builder()
                .id(id)
                .usgsId("us2025test")
                .magnitude(4.5)
                .magType("ml")
                .place("10km N of Somewhere")
                .title("M 4.5 - 10km N of Somewhere")
                .time(NOW)
                .latitude(34.0)
                .longitude(-118.0)
                .depth(10.0)
                .fetchedAt(NOW)
                .build();
    }

    @Test
    void getAll_returns200WithList() throws Exception {
        List<Earthquake> list = List.of(sampleEarthquake(1L), sampleEarthquake(2L));
        when(earthquakeService.findAll(any(), any())).thenReturn(list);

        mockMvc.perform(get("/api/earthquakes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].usgsId", is("us2025test")));
    }

    @Test
    void fetchFromUsgs_returns200WithCount() throws Exception {
        when(earthquakeService.fetchAndStore()).thenReturn(5);

        mockMvc.perform(post("/api/earthquakes/fetch"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", is(5)));
    }

    @Test
    void getById_found_returns200() throws Exception {
        when(earthquakeService.findById(1L)).thenReturn(sampleEarthquake(1L));

        mockMvc.perform(get("/api/earthquakes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usgsId", is("us2025test")))
                .andExpect(jsonPath("$.magnitude", is(4.5)));
    }

    @Test
    void getById_notFound_returns404() throws Exception {
        when(earthquakeService.findById(999L)).thenThrow(new EarthquakeNotFoundException(999L));

        mockMvc.perform(get("/api/earthquakes/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void deleteById_success_returns204() throws Exception {
        doNothing().when(earthquakeService).deleteById(1L);

        mockMvc.perform(delete("/api/earthquakes/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteById_notFound_returns404() throws Exception {
        doThrow(new EarthquakeNotFoundException(999L)).when(earthquakeService).deleteById(999L);

        mockMvc.perform(delete("/api/earthquakes/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message").exists());
    }
}
