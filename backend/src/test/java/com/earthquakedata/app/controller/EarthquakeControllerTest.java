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

import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.List;

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

    private static final Instant NOW = Instant.parse("2025-06-15T12:00:00Z");

    /** MongoDB uses String ObjectIds. */
    private Earthquake sampleEarthquake(String id) {
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
    void getAll_returns200WithPage() throws Exception {
        List<Earthquake> list = List.of(sampleEarthquake("id1"), sampleEarthquake("id2"));
        PageImpl<Earthquake> page = new PageImpl<>(list, PageRequest.of(0, 20), 2);
        when(earthquakeService.findAll(any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/earthquakes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].usgsId", is("us2025test")))
                .andExpect(jsonPath("$.totalElements", is(2)))
                .andExpect(jsonPath("$.totalPages", is(1)));
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
        when(earthquakeService.findById("abc123")).thenReturn(sampleEarthquake("abc123"));

        mockMvc.perform(get("/api/earthquakes/abc123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usgsId", is("us2025test")))
                .andExpect(jsonPath("$.magnitude", is(4.5)));
    }

    @Test
    void getById_notFound_returns404() throws Exception {
        when(earthquakeService.findById("notexist")).thenThrow(new EarthquakeNotFoundException("notexist"));

        mockMvc.perform(get("/api/earthquakes/notexist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void deleteById_success_returns204() throws Exception {
        doNothing().when(earthquakeService).deleteById("abc123");

        mockMvc.perform(delete("/api/earthquakes/abc123"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteById_notFound_returns404() throws Exception {
        doThrow(new EarthquakeNotFoundException("notexist")).when(earthquakeService).deleteById("notexist");

        mockMvc.perform(delete("/api/earthquakes/notexist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void getAll_invalidMinMag_returns400() throws Exception {
        mockMvc.perform(get("/api/earthquakes").param("minMag", "-1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAll_oversizedPage_returns400() throws Exception {
        mockMvc.perform(get("/api/earthquakes").param("size", "9999"))
                .andExpect(status().isBadRequest());
    }
}
