import { useState } from 'react';

export default function FilterBar({ onApply }) {
  const [minMag, setMinMag] = useState('');
  const [after, setAfter] = useState('');

  function handleApply() {
    onApply({ minMag, after });
  }

  function handleClear() {
    setMinMag('');
    setAfter('');
    onApply({ minMag: '', after: '' });
  }

  return (
    <div className="d-flex gap-3 align-items-end p-3 bg-light border-bottom">
      <div>
        <label className="form-label mb-1">Min Magnitude</label>
        <input
          type="number"
          className="form-control"
          step="0.1"
          value={minMag}
          onChange={(e) => setMinMag(e.target.value)}
          placeholder="e.g. 2.5"
        />
      </div>
      <div>
        <label className="form-label mb-1">After Time (Local)</label>
        <input
          type="datetime-local"
          className="form-control"
          value={after}
          onChange={(e) => setAfter(e.target.value)}
        />
      </div>
      <button className="btn btn-primary" onClick={handleApply}>
        Apply Filters
      </button>
      <button className="btn btn-outline-secondary" onClick={handleClear}>
        Clear
      </button>
    </div>
  );
}
