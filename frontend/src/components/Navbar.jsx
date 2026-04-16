import { useState } from 'react';
import { fetchLatest } from '../api/earthquakeApi';

export default function Navbar({ onRefresh, showToast }) {
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
    <nav className="navbar navbar-dark bg-dark px-3">
      <span className="navbar-brand mb-0 h1">Earthquake Data Manager</span>
      <button
        className="btn btn-outline-light"
        onClick={handleFetch}
        disabled={loading}
      >
        {loading ? 'Fetching...' : 'Fetch Latest'}
      </button>
    </nav>
  );
}
