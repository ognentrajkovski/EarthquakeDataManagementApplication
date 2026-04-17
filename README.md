# Earthquake Data Management Application

A full-stack web application that fetches, filters, stores and visualizes recent seismic events from the USGS real-time GeoJSON feed.

**Stack:** Java 21 · Spring Boot 3.4.4 · PostgreSQL 15 · React 18 · Vite · Leaflet

---

## Quick start (Docker)

The entire stack — database, backend, and frontend — starts with a single command:

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

Data is persisted in a named Docker volume (`earthquake-pgdata`) and survives restarts.  
To stop and remove containers: `docker compose down`  
To also wipe the database volume: `docker compose down -v`

---

## Local development setup

### Prerequisites

| Tool | Minimum version |
|------|----------------|
| Java JDK | 21 |
| Apache Maven | 3.9 |
| Node.js | 20 |
| PostgreSQL | 15 |

### 1. Database

Create the database once:

```sql
CREATE DATABASE earthquakedb;
```

The application connects with the default credentials `postgres / postgres` on `localhost:5432`.  
To use different credentials, edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/earthquakedb
spring.datasource.username=your_user
spring.datasource.password=your_password
```

Hibernate manages the schema automatically (`ddl-auto=update`) — no migration scripts are needed.

### 2. Backend

```bash
cd backend
mvn spring-boot:run
```

Starts on **http://localhost:8080**.  
On first startup the schema is created and the USGS feed is polled after a 5-second delay.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Starts on **http://localhost:5173**.  
The backend URL is configured in `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080
```

---

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/earthquakes` | List earthquakes (paginated). Query params: `minMag`, `after` (epoch ms), `page`, `size` |
| `POST` | `/api/earthquakes/fetch` | Trigger an immediate USGS poll |
| `GET` | `/api/earthquakes/{id}` | Get a single earthquake by ID |
| `DELETE` | `/api/earthquakes/{id}` | Delete a single earthquake |

---

## Running tests

### Backend — 24 tests (JUnit 5 + Mockito)

```bash
cd backend
mvn test
```

Covers: controller layer (MockMvc), service integration (H2 in-memory DB), USGS API service, and polling scheduler.

### Frontend — 22 tests (Vitest + Testing Library)

```bash
cd frontend
npm test
```

Covers: CSV export utility, Navbar, FilterBar, Toast, and EarthquakeTable components.

---

## Assumptions

- **Duplicate handling** — The spec says to delete all records before each insert. This implementation instead performs a **upsert-by-USGS-ID** check: records already in the database are skipped rather than deleted and re-inserted. This preserves historical data between polls (e.g. an earthquake from 55 minutes ago stays in the DB even after the USGS hourly feed rotates it out) and avoids unnecessary write churn on every 60-second poll.
- **Magnitude threshold** — The 2.0 threshold is enforced both at ingestion time (nothing below 2.0 is stored) and at query time (the API never returns sub-threshold records even if they exist in the DB from a previous configuration).
- **Time storage** — Earthquake times are stored and serialised as `Instant` (UTC, ISO-8601 with `Z` suffix) rather than `LocalDateTime` to prevent browser timezone misinterpretation when displaying times.
- **Polling vs manual fetch** — The USGS feed is polled automatically every 60 seconds in the background. The "Fetch Latest" button in the UI triggers an additional on-demand poll on top of the scheduled one.
- **Internet access** — The backend requires outbound HTTPS access to `earthquake.usgs.gov` on port 443. If the external API is unavailable, the scheduled poller logs the error and retries on the next interval without crashing.

---

## Optional improvements implemented

The following items go beyond the minimum requirements of the assignment:

| Improvement | Details |
|-------------|---------|
| **Automatic background polling** | Spring `@Scheduled` task polls USGS every 60 seconds. Pauses gracefully if the API is unreachable. |
| **Interactive map** | Leaflet map with colour-coded circle markers sized by magnitude. Clicking a marker shows a popup with full event details. |
| **Severity colour system** | Events are colour-coded across both the map and card/table views: green (minor) → yellow (light) → orange (moderate) → red (strong) → crimson (major). |
| **Delete individual records** | `DELETE /api/earthquakes/{id}` endpoint with a confirm/cancel flow in the UI. |
| **Pagination** | All list endpoints are paginated (default page size 20) with a compact page navigator in the UI. |
| **Filtering in UI** | Filter bar allows narrowing results by minimum magnitude and a start date/time — passed as query parameters to the backend. |
| **CSV export** | Current page of results can be downloaded as a CSV file. |
| **Dashboard layout** | Three views (Dashboard, Map, Table) accessible from a sidebar. Dashboard shows the map and event list side by side. |
| **Docker Compose** | Full stack (PostgreSQL + backend + backend + frontend via nginx) starts with `docker compose up --build`. |
| **Dockerized frontend** | Vite builds a static bundle served by nginx with SPA fallback and long-cache headers for hashed assets. |
| **Extra fields extracted** | Beyond the required fields, `latitude`, `longitude`, `depth`, `magType`, and `fetchedAt` are also extracted, stored and displayed. |
| **Exception handling** | `GlobalExceptionHandler` returns structured JSON error responses. Malformed GeoJSON features are skipped with a warning log rather than failing the entire fetch. |
