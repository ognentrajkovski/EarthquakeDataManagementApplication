import { useState, useEffect, useCallback, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import EarthquakeTable from './components/EarthquakeTable';
import EarthquakeMap from './components/EarthquakeMap';
import Toast from './components/Toast';
import { getAllEarthquakes } from './api/earthquakeApi';
import { downloadCsv } from './utils/csvExport';

function App() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ minMag: '', after: '' });
  const [view, setView] = useState('table');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Poll interval for the silent background refresh (ms). Matches the
  // backend scheduler cadence (earthquake.polling.interval-ms).
  const POLL_INTERVAL_MS = 60_000;

  // Ref holding the latest loader so the interval never needs to be re-created
  // when filters/page change.
  const loaderRef = useRef(null);
  const inFlightRef = useRef(false);

  function showToast(message, type = 'danger') {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const loadEarthquakes = useCallback(async ({ silent = false } = {}) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await getAllEarthquakes(filters.minMag, filters.after, page);
      setEarthquakes(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
      setLastUpdated(new Date());
    } catch {
      // A silent background poll shouldn't clobber what the user sees on screen
      // with an error banner — just log it and try again on the next tick.
      if (!silent) setError('Failed to load earthquakes');
    } finally {
      if (!silent) setLoading(false);
      inFlightRef.current = false;
    }
  }, [filters, page]);

  // Keep a ref to the latest loader so the polling interval can call it
  // without being torn down and rebuilt every time filters/page change.
  useEffect(() => {
    loaderRef.current = loadEarthquakes;
  }, [loadEarthquakes]);

  // Initial load + reload on filter/page change.
  useEffect(() => {
    loadEarthquakes();
  }, [loadEarthquakes]);

  // Auto-refresh every POLL_INTERVAL_MS. Pauses when the tab is hidden
  // and fires an immediate refresh when it becomes visible again.
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') {
        loaderRef.current?.({ silent: true });
      }
    };
    const id = setInterval(tick, POLL_INTERVAL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        loaderRef.current?.({ silent: true });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  function handleApplyFilters(newFilters) {
    setPage(0);
    setFilters(newFilters);
  }

  function handleExportCsv() {
    if (!earthquakes.length) {
      showToast('No earthquakes to export', 'danger');
      return;
    }
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadCsv(earthquakes, `earthquakes-${stamp}.csv`);
    showToast(`Exported ${earthquakes.length} earthquakes`, 'success');
  }

  return (
    <div>
      <Navbar onRefresh={loadEarthquakes} showToast={showToast} />
      <FilterBar onApply={handleApplyFilters} />
      <div className="d-flex gap-2 align-items-center p-3">
        <button
          className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setView('table')}
        >
          Table View
        </button>
        <button
          className={`btn btn-sm ${view === 'map' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setView('map')}
        >
          Map View
        </button>
        <button
          className="btn btn-sm btn-outline-success"
          onClick={handleExportCsv}
          disabled={!earthquakes.length}
          title="Download current page as CSV"
        >
          Export CSV
        </button>
        <span className="text-muted ms-auto small">
          {totalElements} earthquakes total
          {lastUpdated && (
            <span className="ms-3">
              Auto-refresh: every 60s · Updated{' '}
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </span>
      </div>
      {view === 'table' ? (
        <>
          <EarthquakeTable
            earthquakes={earthquakes}
            loading={loading}
            error={error}
            onRefresh={loadEarthquakes}
            showToast={showToast}
          />
          {totalPages > 1 && (
            <nav className="d-flex justify-content-center p-3">
              <ul className="pagination mb-0">
                <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p - 1)}>Previous</button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i} className={`page-item ${i === page ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p + 1)}>Next</button>
                </li>
              </ul>
            </nav>
          )}
        </>
      ) : (
        <EarthquakeMap earthquakes={earthquakes} />
      )}

      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
