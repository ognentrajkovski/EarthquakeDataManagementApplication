# Earthquake Data Management Application — Agent Instructions

## Project Overview

Build a full-stack web application that fetches, filters, stores, and visualizes recent earthquake data from the USGS public API. The stack is Java (Spring Boot) + PostgreSQL + React.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Java 17+, Spring Boot 3.x           |
| Database   | PostgreSQL 15+                      |
| Frontend   | React (Vite), Axios, Bootstrap 5    |
| Testing    | JUnit 5, Mockito, Spring Boot Test  |
| Build tool | Maven                               |

---

## Project Structure

```
earthquake-app/
├── backend/                          # Spring Boot project (Maven)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/codeit/earthquake/
│   │   │   │   ├── EarthquakeApplication.java
│   │   │   │   ├── config/
│   │   │   │   │   └── AppConfig.java              # RestTemplate / WebClient bean
│   │   │   │   ├── controller/
│   │   │   │   │   └── EarthquakeController.java   # REST endpoints
│   │   │   │   ├── dto/
│   │   │   │   │   ├── EarthquakeDto.java
│   │   │   │   │   └── GeoJsonResponse.java        # USGS response mapping
│   │   │   │   ├── exception/
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   ├── ExternalApiException.java
│   │   │   │   │   └── EarthquakeNotFoundException.java
│   │   │   │   ├── model/
│   │   │   │   │   └── Earthquake.java             # JPA entity
│   │   │   │   ├── repository/
│   │   │   │   │   └── EarthquakeRepository.java   # Spring Data JPA
│   │   │   │   └── service/
│   │   │   │       ├── EarthquakeService.java      # interface
│   │   │   │       ├── EarthquakeServiceImpl.java  # business logic
│   │   │   │       └── UsgsApiService.java         # USGS fetch + parse
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   │       └── java/com/codeit/earthquake/
│   │           ├── service/
│   │           │   └── EarthquakeServiceIntegrationTest.java
│   │           └── controller/
│   │               └── EarthquakeControllerTest.java
│   └── pom.xml
├── frontend/                         # React + Vite app
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── api/
│   │   │   └── earthquakeApi.js      # Axios calls
│   │   ├── components/
│   │   │   ├── EarthquakeTable.jsx
│   │   │   ├── EarthquakeMap.jsx     # Leaflet map (optional)
│   │   │   ├── FilterBar.jsx
│   │   │   └── Navbar.jsx
│   │   └── styles/
│   │       └── App.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml                # PostgreSQL + optional full stack
└── README.md
```

---

## Database — Earthquake Entity

**Table name:** `earthquakes`

| Column       | Type          | Notes                        |
|--------------|---------------|------------------------------|
| id           | BIGINT PK     | Auto-generated               |
| usgs_id      | VARCHAR(255)  | Unique ID from USGS          |
| magnitude    | DOUBLE        | mag field                    |
| mag_type     | VARCHAR(50)   | magType field                |
| place        | VARCHAR(512)  | place field                  |
| title        | VARCHAR(512)  | title field                  |
| time         | TIMESTAMP     | epoch ms → LocalDateTime     |
| latitude     | DOUBLE        | geometry.coordinates[1]      |
| longitude    | DOUBLE        | geometry.coordinates[0]      |
| depth        | DOUBLE        | geometry.coordinates[2]      |
| fetched_at   | TIMESTAMP     | when we stored it            |

Use `spring.jpa.hibernate.ddl-auto=update` for auto schema creation.

---

## Backend — REST API Endpoints

Base path: `/api/earthquakes`

| Method | Path              | Description                                               |
|--------|-------------------|-----------------------------------------------------------|
| POST   | `/fetch`          | Fetch from USGS, filter, clear DB, insert fresh data      |
| GET    | `/`               | Return all stored earthquakes                             |
| GET    | `/?minMag=2.0`    | Filter by minimum magnitude (query param)                 |
| GET    | `/?after={epoch}` | Filter by time (epoch ms, query param)                    |
| GET    | `/{id}`           | Get single earthquake by DB id                            |
| DELETE | `/{id}`           | Delete a specific earthquake record (optional)            |

All responses use JSON. Error responses follow a standard error body:
```json
{ "status": 404, "message": "Earthquake not found", "timestamp": "..." }
```

---

## Backend — Key Implementation Rules

### UsgsApiService
- Use `RestTemplate` (or `WebClient`) to GET `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson`
- Parse the GeoJSON: `features[]` → each feature has `properties` and `geometry`
- Extract: `properties.mag`, `properties.magType`, `properties.place`, `properties.title`, `properties.time` (epoch ms), `geometry.coordinates` [lon, lat, depth]
- Handle null/missing fields gracefully — skip malformed entries, log a warning
- Throw `ExternalApiException` if the HTTP call fails

### EarthquakeServiceImpl
- `fetchAndStore()`:
  1. Call `UsgsApiService` to get raw list
  2. Filter: keep only `magnitude > 2.0`
  3. Skip existing records based on usgsId
  4. Save filtered list via `repository.saveAll()`
  5. Return saved count
- `findAll(Optional<Double> minMag, Optional<Long> afterEpoch)`:
  - Apply filters dynamically using Spring Data JPA Specifications or query methods
- `findById(Long id)`: throw `EarthquakeNotFoundException` if absent
- `deleteById(Long id)`: throw `EarthquakeNotFoundException` if absent

### Exception Handling
- `@RestControllerAdvice` global handler
- Map each custom exception to an HTTP status code
- Never leak stack traces to the client
- Log all exceptions server-side with SLF4J

---

## application.properties

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/earthquakedb
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

server.port=8080

# CORS — allow React dev server
spring.web.cors.allowed-origins=http://localhost:5173
```

Add a `@CrossOrigin` annotation on the controller or configure a global CORS bean.

---

## Frontend — React App

### Pages / Components

1. **Navbar** — app title, a "Fetch Latest" button that calls `POST /api/earthquakes/fetch`
2. **FilterBar** — inputs for minimum magnitude and "after time" (datetime-local input), a "Apply Filters" button
3. **EarthquakeTable** — Bootstrap table showing: Title, Magnitude, Mag Type, Place, Time (formatted), Lat, Lon, Depth. Each row has a Delete button (optional).
4. **EarthquakeMap** *(optional)* — Leaflet map (`react-leaflet`) with a circle marker per earthquake; marker radius proportional to magnitude; popup shows title + mag.

### State & Data Flow
- On mount: load all earthquakes from `GET /api/earthquakes/`
- "Fetch Latest" button: `POST /api/earthquakes/fetch`, then reload list
- Filter changes: call `GET /api/earthquakes/?minMag=X&after=Y`
- Show loading spinner during requests; show error toast on failure

### Axios base URL
Point to `http://localhost:8080` in development. Use an `.env` file with `VITE_API_URL`.

---

## Testing Requirements

### Integration Tests (EarthquakeServiceIntegrationTest)
Use `@SpringBootTest` + `@AutoConfigureTestDatabase` (H2 in-memory) or Testcontainers (PostgreSQL).

Cover:
1. `fetchAndStore()` — mock `UsgsApiService` to return a known list; verify DB contains only those with mag > 2.0 and old records are deleted.
2. `findAll()` with `minMag` filter — assert correct subset returned.
3. `findAll()` with `afterEpoch` filter — assert correct subset returned.
4. `findById()` — found case and not-found case (expect exception).
5. `deleteById()` — found case and not-found case (expect exception).

### Controller Tests (EarthquakeControllerTest)
Use `@WebMvcTest` + `MockMvc` + `@MockBean` for the service.

Cover:
1. `GET /api/earthquakes/` returns 200 with list.
2. `POST /api/earthquakes/fetch` returns 200 with count.
3. `GET /api/earthquakes/{id}` — 200 found, 404 not found.
4. `DELETE /api/earthquakes/{id}` — 204 success, 404 not found.

---

## Docker Compose (for PostgreSQL)

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: earthquakedb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
```

---

## README.md Requirements

The README must include:

1. **Project Setup** — prerequisites (Java 17, Node 18, PostgreSQL / Docker)
2. **Database Configuration** — how to create the DB or use docker-compose
3. **Running the Backend** — `mvn spring-boot:run` from `/backend`
4. **Running the Frontend** — `npm install && npm run dev` from `/frontend`
5. **API Reference** — table of all endpoints
6. **Assumptions Made** — e.g., only last-hour data, mag > 2.0 threshold
7. **Optional Improvements Implemented** — map view, delete endpoint, etc.

---

## Code Quality Rules

- Follow standard Java naming conventions and package structure
- Use `@Slf4j` (Lombok) for logging; no `System.out.println`
- Use Lombok (`@Data`, `@Builder`, `@RequiredArgsConstructor`) to reduce boilerplate
- Services must be interfaces with `Impl` classes (dependency inversion)
- No business logic in controllers — controllers only delegate to services
- Validate inputs with `@Valid` / `@RequestParam` defaults where appropriate
- All public methods in service classes must have Javadoc comments
- No hardcoded URLs — externalize to `application.properties`
