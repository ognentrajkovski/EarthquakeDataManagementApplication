import { useState, useEffect, useCallback } from 'react';
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

  function showToast(message, type = 'danger') {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const loadEarthquakes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllEarthquakes(filters.minMag, filters.after, page);
      setEarthquakes(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch {
      setError('Failed to load earthquakes');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadEarthquakes();
  }, [loadEarthquakes]);

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
        <span className="text-muted ms-auto">{totalElements} earthquakes total</span>
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
