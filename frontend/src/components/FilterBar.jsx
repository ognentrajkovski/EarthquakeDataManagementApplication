import { useState } from 'react';

/**
 * Magnitude / time filter controls.
 * Emits `{ minMag, after }` up to the parent on Apply or Clear.
 */
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
    <div className="filter-bar" role="search" aria-label="Earthquake filters">
      <div className="form-field">
        <label htmlFor="flt-min-mag">Min Magnitude</label>
        <input
          id="flt-min-mag"
          type="number"
          className="form-control-dark"
          step="0.1"
          value={minMag}
          onChange={(e) => setMinMag(e.target.value)}
          placeholder="e.g. 2.5"
        />
      </div>

      <div className="form-field">
        <label htmlFor="flt-after">After Time (Local)</label>
        <input
          id="flt-after"
          type="datetime-local"
          className="form-control-dark"
          value={after}
          onChange={(e) => setAfter(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" className="btn-action btn-action-primary" onClick={handleApply}>
          Apply Filters
        </button>
        <button type="button" className="btn-action btn-action-ghost" onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>
  );
}
