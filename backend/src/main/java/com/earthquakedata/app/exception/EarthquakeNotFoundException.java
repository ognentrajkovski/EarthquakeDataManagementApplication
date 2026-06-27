package com.earthquakedata.app.exception;

public class EarthquakeNotFoundException extends RuntimeException {

    public EarthquakeNotFoundException(String id) {
        super("Earthquake not found with id: " + id);
    }
}
