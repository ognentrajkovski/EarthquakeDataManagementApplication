package com.earthquakedata.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AppConfig {

    @Value("${spring.web.cors.allowed-origins}")
    private String allowedOrigins;

    /**
     * RestTemplate with explicit connect and read timeouts so that a slow or
     * unreachable USGS endpoint cannot block Tomcat worker threads indefinitely.
     */
    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);  // 5 s
        factory.setReadTimeout(10_000);    // 10 s
        return new RestTemplate(factory);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Split comma-separated origins so each value is registered individually.
                // A single joined string would be treated as one (invalid) origin.
                String[] origins = allowedOrigins.split(",");
                registry.addMapping("/api/**")
                        .allowedOrigins(origins)
                        .allowedMethods("GET", "POST", "DELETE", "OPTIONS");
            }
        };
    }
}
