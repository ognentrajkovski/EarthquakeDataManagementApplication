import { useState } from 'react';
import { deleteEarthquake } from '../api/earthquakeApi';
import { getSeverity } from '../utils/severity';
import SeverityBadge from './SeverityBadge';

/**
 * Single-row card for an earthquake event.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────┐
 *   │ [MAG]  Location                  [Badge] [Del]  │  ← headline
 *   │ ─────────────────────────────────────────────── │
 *   │  TIME     2025-06-15 12:00:00 UTC                │
 *   │  DEPTH    12.3 km                                │  ← details
 *   │  COORDS   34.50, -118.25                         │
 *   └─────────────────────────────────────────────────┘
 */
export default function EarthquakeCard({ earthquake: eq, onDeleted, showToast, onHover }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const sev = getSeverity(eq.magnitude);
  const location = eq.place || eq.title || 'Unknown location';

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteEarthquake(eq.id);
      showToast('Earthquake deleted', 'success');
      onDeleted?.();
    } catch {
      showToast('Failed to delete earthquake');
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <article
      className="eq-card"
      onMouseEnter={() => onHover?.(eq)}
      onMouseLeave={() => onHover?.(null)}
    >
      <header className="eq-card-top">
        <div
          className="eq-card-mag"
          style={{
            background: `${sev.color}14`,
            borderColor: `${sev.color}55`,
          }}
          aria-label={`Magnitude ${eq.magnitude} on the ${eq.magType || 'unknown'} scale`}
        >
          <div className="eq-card-mag-cell">
            <span className="eq-card-mag-value" style={{ color: sev.color }}>
              {eq.magnitude != null ? Number(eq.magnitude).toFixed(1) : '—'}
            </span>
            <span className="eq-card-mag-label" aria-hidden>Magnitude</span>
          </div>
          <span className="eq-card-mag-divider" aria-hidden />
          <div className="eq-card-mag-cell">
            <span className="eq-card-mag-type">{(eq.magType || '—').toUpperCase()}</span>
            <span className="eq-card-mag-label" aria-hidden>Scale</span>
          </div>
        </div>

        <h3 className="eq-card-location" title={location}>{location}</h3>

        <div className="eq-card-actions">
          <SeverityBadge magnitude={eq.magnitude} />
          {confirming ? (
            <>
              <button
                type="button"
                className="btn-action btn-action-sm btn-action-danger-ghost"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? '…' : 'Confirm'}
              </button>
              <button
                type="button"
                className="btn-action btn-action-sm btn-action-ghost"
                onClick={() => setConfirming(false)}
                disabled={deleting}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn-action btn-action-sm btn-action-ghost"
              onClick={() => setConfirming(true)}
              aria-label={`Delete earthquake ${location}`}
            >
              Delete
            </button>
          )}
        </div>
      </header>

      <dl className="eq-card-details">
        <Detail label="Time" value={fmtTime(eq.time)} />
        <Detail label="Depth" value={eq.depth != null ? `${Number(eq.depth).toFixed(1)} km` : '—'} />
        <Detail label="Coordinates" value={`${fmtCoord(eq.latitude)}, ${fmtCoord(eq.longitude)}`} />
      </dl>
    </article>
  );
}

function Detail({ label, value }) {
  return (
    <div className="eq-card-detail">
      <dt className="eq-card-detail-label">{label}</dt>
      <dd className="eq-card-detail-value">{value}</dd>
    </div>
  );
}

function fmtCoord(n) {
  if (n == null) return '—';
  return Number(n).toFixed(2);
}

function fmtTime(t) {
  if (!t) return '—';
  return new Date(t).toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC';
}
