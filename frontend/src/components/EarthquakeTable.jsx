import { useState, useMemo } from 'react';
import { deleteEarthquake } from '../api/earthquakeApi';

const SORTABLE_COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'magnitude', label: 'Magnitude' },
  { key: 'magType', label: 'Mag Type' },
  { key: 'place', label: 'Place' },
  { key: 'time', label: 'Time (UTC)' },
  { key: 'latitude', label: 'Lat' },
  { key: 'longitude', label: 'Lon' },
  { key: 'depth', label: 'Depth' },
];

export default function EarthquakeTable({ earthquakes, loading, error, onRefresh, showToast }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [confirmId, setConfirmId] = useState(null);

  function handleSort(key) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
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
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        {error}
      </div>
    );
  }

  if (earthquakes.length === 0) {
    return <p className="text-center p-3 text-muted">No earthquakes to display.</p>;
  }

  function sortIndicator(key) {
    if (sortKey !== key) return '';
    return sortAsc ? ' \u25B2' : ' \u25BC';
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover mb-0">
        <thead className="table-dark">
          <tr>
            {SORTABLE_COLUMNS.map((col) => (
              <th
                key={col.key}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort(col.key)}
              >
                {col.label}{sortIndicator(col.key)}
              </th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((eq) => (
            <tr key={eq.id}>
              <td>{eq.title}</td>
              <td>{eq.magnitude}</td>
              <td>{eq.magType}</td>
              <td>{eq.place}</td>
              <td>{eq.time ? new Date(eq.time).toLocaleString('en-US', { timeZone: 'UTC' }) : '-'}</td>
              <td>{eq.latitude}</td>
              <td>{eq.longitude}</td>
              <td>{eq.depth}</td>
              <td>
                {confirmId === eq.id ? (
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(eq.id)}
                    >
                      Confirm
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setConfirmId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setConfirmId(eq.id)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
