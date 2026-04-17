import { useState } from 'react';
import { fetchLatest } from '../api/earthquakeApi';

/**
 * Top bar — application title, live feed indicator, last-updated timestamp,
 * and the manual "Fetch Latest" action.
 */
export default function Navbar({ onRefresh, showToast, lastUpdated }) {
  const [loading, setLoading] = useState(false);

  async function handleFetch() {
    setLoading(true);
    try {
      const res = await fetchLatest();
      showToast(`Fetched ${res.data.count} earthquakes from USGS`, 'success');
      onRefresh();
    } catch {
      showToast('Failed to fetch latest earthquake data');
    } finally {
      setLoading(false);
    }
  }

  return (
    <header className="topbar" role="banner">
      <div>
        <div className="topbar-title">Earthquake Data Manager</div>
        <div className="topbar-sub">Real-time seismic activity</div>
      </div>

      <div className="topbar-status" aria-live="polite">
        <span className="pulse-dot" aria-hidden />
        <span>Live · USGS Feed</span>
      </div>

      {lastUpdated && (
        <div className="topbar-updated" aria-label="Last updated">
          Updated {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      <div style={{ marginLeft: 'auto' }}>
        <button
          type="button"
          className="btn-action btn-action-primary"
          onClick={handleFetch}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
              Fetching...
            </>
          ) : (
            <>
              <RefreshIcon />
              Fetch Latest
            </>
          )}
        </button>
      </div>
    </header>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
