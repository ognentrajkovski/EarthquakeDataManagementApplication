import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import EarthquakeCard from './components/EarthquakeCard';
import EarthquakeTable from './components/EarthquakeTable';
import EarthquakeMap from './components/EarthquakeMap';
import Toast from './components/Toast';

import { getAllEarthquakes } from './api/earthquakeApi';
import { downloadCsv } from './utils/csvExport';

/** Must match `earthquake.polling.interval-ms` on the backend. */
const POLL_INTERVAL_MS = 60_000;

export default function App() {
  /* -------------- data / request state -------------- */
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ minMag: '', after: '' });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  /* -------------- UI state -------------- */
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'map' | 'table'
  const [toasts, setToasts] = useState([]);

  /* -------------- refs -------------- */
  const loaderRef = useRef(null);
  const inFlightRef = useRef(false);

  /* -------------- toast helpers -------------- */
  const showToast = useCallback((message, type = 'danger') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* -------------- data loader -------------- */
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
      if (!silent) setError('Failed to load earthquakes');
    } finally {
      if (!silent) setLoading(false);
      inFlightRef.current = false;
    }
  }, [filters, page]);

  useEffect(() => {
    loaderRef.current = loadEarthquakes;
  }, [loadEarthquakes]);

  useEffect(() => {
    loadEarthquakes();
  }, [loadEarthquakes]);

  /* -------------- auto-refresh (pause when hidden) -------------- */
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

  /* -------------- derived stats -------------- */
  const stats = useMemo(() => {
    if (!earthquakes.length) {
      return { total: totalElements, maxMag: null, maxDepth: null, strongCount: 0 };
    }
    const mags = earthquakes.map((e) => Number(e.magnitude)).filter((n) => !Number.isNaN(n));
    const depths = earthquakes.map((e) => Number(e.depth)).filter((n) => !Number.isNaN(n));
    const maxMag = mags.length ? Math.max(...mags) : null;
    const maxDepth = depths.length ? Math.max(...depths) : null;
    const strongCount = earthquakes.filter((e) => Number(e.magnitude) >= 4.5).length;
    return { total: totalElements, maxMag, maxDepth, strongCount };
  }, [earthquakes, totalElements]);

  /* -------------- handlers -------------- */
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

  /* -------------- render -------------- */
  return (
    <div className="app-shell" data-bs-theme="light">
      <Sidebar view={view} onViewChange={setView} stats={stats} />

      <div className="main-column">
        <Navbar onRefresh={loadEarthquakes} showToast={showToast} lastUpdated={lastUpdated} />

        <main className="main">
          <PageHeader
            view={view}
            totalElements={totalElements}
            onExport={handleExportCsv}
            canExport={earthquakes.length > 0}
          />

          <FilterBar onApply={handleApplyFilters} />

          {view === 'dashboard' && (
            <div className="split">
              <section className="card-panel card-panel-flush" aria-label="Map">
                <div className="map-panel-body"><EarthquakeMap earthquakes={earthquakes} /></div>
              </section>

              <section className="card-panel" style={{ padding: 0, overflow: 'hidden' }} aria-label="Event list">
                <div style={{ padding: '1rem 1.125rem', borderBottom: '1px solid var(--border)' }}>
                  <div className="card-panel-header" style={{ marginBottom: 0 }}>
                    <div className="card-panel-title">Recent Events</div>
                    <span className="text-muted-2" style={{ fontSize: '0.72rem' }}>
                      {earthquakes.length} on this page
                    </span>
                  </div>
                </div>
                <EventList
                  earthquakes={earthquakes}
                  loading={loading}
                  error={error}
                  onDeleted={loadEarthquakes}
                  showToast={showToast}
                />
                {totalPages > 1 && (
                  <div style={{ padding: '0.625rem', borderTop: '1px solid var(--border)' }}>
                    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                  </div>
                )}
              </section>
            </div>
          )}

          {view === 'map' && (
            <section className="card-panel card-panel-flush" aria-label="Full map"
                     style={{ height: '72vh', minHeight: 480 }}>
              <div className="map-panel-body" style={{ height: '100%' }}>
                <EarthquakeMap earthquakes={earthquakes} />
              </div>
            </section>
          )}

          {view === 'table' && (
            <section className="card-panel card-panel-flush" aria-label="Table">
              <EarthquakeTable
                earthquakes={earthquakes}
                loading={loading}
                error={error}
                onRefresh={loadEarthquakes}
                showToast={showToast}
              />
              <div style={{ padding: '0.75rem' }}>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            </section>
          )}
        </main>
      </div>

      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type}
                 onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   Local subcomponents (kept inline for App-scope concerns)
   ========================================================= */

function PageHeader({ view, totalElements, onExport, canExport }) {
  const titles = {
    dashboard: { title: 'Dashboard',   sub: 'Live seismic overview' },
    map:       { title: 'Map View',    sub: 'Geospatial distribution of events' },
    table:     { title: 'Table View',  sub: 'Sortable, filterable event log' },
  }[view] ?? { title: 'Dashboard', sub: '' };

  return (
    <div className="page-header">
      <div>
        <h1>{titles.title}</h1>
        <p className="page-header-sub">
          {titles.sub} · <span className="mono">{totalElements}</span> total events
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          className="btn-action btn-action-ghost"
          onClick={onExport}
          disabled={!canExport}
          title="Download current page as CSV"
        >
          <DownloadIcon /> Export CSV
        </button>
      </div>
    </div>
  );
}

function EventList({ earthquakes, loading, error, onDeleted, showToast }) {
  return (
    <div className="event-list-wrap">
      {loading && (
        <div className="state-center" role="status">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <div className="spinner" />
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {!loading && error && (
        <div className="alert-inline" role="alert">{error}</div>
      )}
      {!loading && !error && !earthquakes.length && (
        <div className="state-center">No earthquakes match the current filters.</div>
      )}
      {!loading && !error && earthquakes.length > 0 && (
        <div className="event-list event-list-enter">
          {earthquakes.map((eq) => (
            <EarthquakeCard
              key={eq.id}
              earthquake={eq}
              onDeleted={onDeleted}
              showToast={showToast}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  // Compact window: first, last, current ±1
  const pages = [];
  const window_ = new Set([0, totalPages - 1, page, page - 1, page + 1]);
  [...window_]
    .filter((i) => i >= 0 && i < totalPages)
    .sort((a, b) => a - b)
    .forEach((i, idx, arr) => {
      if (idx > 0 && i - arr[idx - 1] > 1) pages.push('…');
      pages.push(i);
    });

  return (
    <nav className="pager" aria-label="Pagination">
      <button
        type="button" className="pager-btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        aria-label="Previous page"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`dots-${i}`} className="pager-btn" style={{ border: 'none', background: 'transparent', cursor: 'default' }}>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`pager-btn ${p === page ? 'active' : ''}`}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p + 1}
          </button>
        )
      )}
      <button
        type="button" className="pager-btn"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
