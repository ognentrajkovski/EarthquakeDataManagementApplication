/**
 * Fixed left-rail navigation for the dashboard.
 */

const ICON = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="nav-item-icon">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="nav-item-icon">
      <path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Z" />
      <path d="M9 3v16M15 5v16" />
    </svg>
  ),
  table: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="nav-item-icon">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M9 4v16" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: ICON.dashboard },
  { id: 'map',       label: 'Map View',  icon: ICON.map },
  { id: 'table',     label: 'Table View', icon: ICON.table },
];

export default function Sidebar({ view, onViewChange, stats }) {
  return (
    <aside className="sidebar" aria-label="Primary">
      <div className="sidebar-brand">
        <div className="sidebar-brand-logo" aria-hidden>SM</div>
        <div>
          <div className="sidebar-brand-title">Seismic Monitor</div>
          <div className="sidebar-brand-subtitle">USGS Real-time</div>
        </div>
      </div>

      <nav>
        <div className="sidebar-section-label">Navigation</div>
        <div className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${view === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
              aria-current={view === item.id ? 'page' : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {stats && (
        <div>
          <div className="sidebar-section-label">Current Feed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0.25rem 0.75rem' }}>
            <SidebarStat label="Events" value={stats.total ?? 0} />
            <SidebarStat label="Max Magnitude" value={fmt(stats.maxMag)} />
            <SidebarStat label="Max Depth" value={fmt(stats.maxDepth, ' km')} />
          </div>
        </div>
      )}

      <div className="sidebar-footer">
        Data © <a href="https://earthquake.usgs.gov" target="_blank" rel="noreferrer"
                  style={{ color: 'inherit' }}>USGS</a>
      </div>
    </aside>
  );
}

function SidebarStat({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
      <span style={{ color: 'var(--text-2)' }}>{label}</span>
      <span className="mono" style={{ color: 'var(--text-0)' }}>{value}</span>
    </div>
  );
}

function fmt(n, suffix = '') {
  if (n == null || Number.isNaN(n)) return '—';
  return `${Number(n).toFixed(1)}${suffix}`;
}
