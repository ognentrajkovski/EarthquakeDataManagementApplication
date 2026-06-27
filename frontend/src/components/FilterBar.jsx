import { useState } from 'react';

/** Valid magnitude range (matches the server-side @Min(0) @Max(10) constraint). */
const MAG_MIN = 0;
const MAG_MAX = 10;

/**
 * Magnitude / time filter controls.
 * Emits `{ minMag, after }` up to the parent on Apply or Clear.
 * Client-side validation prevents out-of-range values from ever reaching the API.
 */
export default function FilterBar({ onApply }) {
  const [minMag, setMinMag] = useState('');
  const [after, setAfter]   = useState('');
  const [magError, setMagError] = useState('');

  function validateMag(value) {
    if (value === '') return '';
    const n = Number(value);
    if (Number.isNaN(n)) return 'Must be a number';
    if (n < MAG_MIN) return `Must be ≥ ${MAG_MIN}`;
    if (n > MAG_MAX) return `Must be ≤ ${MAG_MAX}`;
    return '';
  }

  function handleMagChange(e) {
    const val = e.target.value;
    setMinMag(val);
    setMagError(validateMag(val));
  }

  function handleApply() {
    const err = validateMag(minMag);
    if (err) {
      setMagError(err);
      return;
    }
    onApply({ minMag, after });
  }

  function handleClear() {
    setMinMag('');
    setAfter('');
    setMagError('');
    onApply({ minMag: '', after: '' });
  }

  return (
    <div className="filter-bar" role="search" aria-label="Earthquake filters">
      <div className="form-field">
        <label htmlFor="flt-min-mag">Min Magnitude</label>
        <input
          id="flt-min-mag"
          type="number"
          className={`form-control-dark${magError ? ' input-error' : ''}`}
          step="0.1"
          min={MAG_MIN}
          max={MAG_MAX}
          value={minMag}
          onChange={handleMagChange}
          placeholder="e.g. 2.5"
          aria-describedby={magError ? 'mag-error' : undefined}
          aria-invalid={!!magError}
        />
        {magError && (
          <span id="mag-error" className="field-error" role="alert">{magError}</span>
        )}
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

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
        <button
          type="button"
          className="btn-action btn-action-primary"
          onClick={handleApply}
          disabled={!!magError}
        >
          Apply Filters
        </button>
        <button type="button" className="btn-action btn-action-ghost" onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>
  );
}
