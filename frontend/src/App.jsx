import { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import EarthquakeTable from './components/EarthquakeTable';
import EarthquakeMap from './components/EarthquakeMap';
import { getAllEarthquakes } from './api/earthquakeApi';

function App() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ minMag: '', after: '' });
  const [view, setView] = useState('table');

  const loadEarthquakes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllEarthquakes(filters.minMag, filters.after);
      setEarthquakes(res.data);
    } catch {
      setError('Failed to load earthquakes');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadEarthquakes();
  }, [loadEarthquakes]);

  function handleApplyFilters(newFilters) {
    setFilters(newFilters);
  }

  return (
    <div>
      <Navbar onRefresh={loadEarthquakes} />
      <FilterBar onApply={handleApplyFilters} />
      <div className="d-flex gap-2 p-3">
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
      </div>
      {view === 'table' ? (
        <EarthquakeTable
          earthquakes={earthquakes}
          loading={loading}
          error={error}
          onRefresh={loadEarthquakes}
        />
      ) : (
        <EarthquakeMap earthquakes={earthquakes} />
      )}
    </div>
  );
}

export default App;
