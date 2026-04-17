import { useState, useMemo } from 'react';
import { deleteEarthquake } from '../api/earthquakeApi';
import { getSeverity } from '../utils/severity';
import SeverityBadge from './SeverityBadge';

const SORTABLE_COLUMNS = [
  { key: 'title',     label: 'Title' },
  { key: 'magnitude', label: 'Magnitude', align: 'right' },
  { key: 'magType',   label: 'Mag Type' },
  { key: 'place',     label: 'Place' },
  { key: 'time',      label: 'Time (UTC)' },
  { key: 'latitude',  label: 'Lat',   align: 'right', mono: true },
  { key: 'longitude', label: 'Lon',   align: 'right', mono: true },
  { key: 'depth',     label: 'Depth', align: 'right', mono: true },
];

/**
 * Data table view. Preserves the same outer API (loading / error / empty
 * states + Delete confirm flow) expected by tests.
 */
export default function EarthquakeTable({ earthquakes, loading, error, onRefresh, showToast }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [confirmId, setConfirmId] = useState(null);

  function handleSort(key) {
    if (sortKey === key) {
      setSortAsc((asc) => !asc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return earthquakes;
    return [...earthquakes].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
      return sortAsc ? cmp : -cmp;
    });
  }, [earthquakes, sortKey, sortAsc]);

  async function handleDelete(id) {
    try {
      await deleteEarthquake(id);
      showToast('Earthquake deleted', 'success');
      setConfirmId(null);
      onRefresh();
    } catch {
      showToast('Failed to delete earthquake');
      setConfirmId(null);
    }
  }

  if (loading) {
    return (
      <div className="state-center" role="status">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          <div className="spinner" />
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert-inline" role="alert">{error}</div>;
  }

  if (earthquakes.length === 0) {
    return <div className="state-center">No earthquakes to display.</div>;
  }

  function sortIndicator(key) {
    if (sortKey !== key) return null;
    return <span aria-hidden style={{ marginLeft: 4 }}>{sortAsc ? '▲' : '▼'}</span>;
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {SORTABLE_COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                style={{ textAlign: col.align ?? 'left' }}
                aria-sort={
                  sortKey === col.key ? (sortAsc ? 'ascending' : 'descending') : 'none'
                }
              >
                {col.label}{sortIndicator(col.key)}
              </th>
            ))}
            <th>Severity</th>
            <th aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((eq) => {
            const sev = getSeverity(eq.magnitude);
            return (
              <tr key={eq.id}>
                <td>{eq.title}</td>
                <td className="mono" style={{ textAlign: 'right', color: sev.color, fontWeight: 600 }}>
                  {eq.magnitude != null ? Number(eq.magnitude).toFixed(1) : '—'}
                </td>
                <td className="text-muted-2" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  {eq.magType}
                </td>
                <td>{eq.place}</td>
                <td className="mono">
                  {eq.time ? new Date(eq.time).toLocaleString('en-US', { timeZone: 'UTC' }) : '-'}
                </td>
                <td className="mono" style={{ textAlign: 'right' }}>{fmt(eq.latitude)}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{fmt(eq.longitude)}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{fmt(eq.depth)}</td>
                <td><SeverityBadge magnitude={eq.magnitude} /></td>
                <td style={{ textAlign: 'right' }}>
                  {confirmId === eq.id ? (
                    <div style={{ display: 'inline-flex', gap: 4 }}>
                      <button
                        type="button"
                        className="btn-action btn-action-sm btn-action-danger-ghost"
                        onClick={() => handleDelete(eq.id)}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        className="btn-action btn-action-sm btn-action-ghost"
                        onClick={() => setConfirmId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn-action btn-action-sm btn-action-ghost"
                      onClick={() => setConfirmId(eq.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function fmt(n) {
  if (n == null) return '—';
  return Number(n).toFixed(2);
}
